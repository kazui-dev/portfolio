import { createFileRoute, notFound, useNavigate, Link } from '@tanstack/react-router';
import { useState, Suspense, lazy } from 'react';
import { MarkdownHooks } from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypePrettyCode from 'rehype-pretty-code';
import { ChevronLeft, Save, Trash2, ExternalLink } from 'lucide-react';
import { getNoteById, upsertNote, deleteNote } from '@/server/admin';
import { Button } from '@/components/ui/button';
import { baseMarkdownComponents, prettyCodeOptions } from '@/components/notes/NoteArticle';
import { cn } from '@/lib/utils';

const NoteEditor = lazy(() => import('@/components/admin/NoteEditor'));

const previewComponents: Components = {
  ...baseMarkdownComponents,
  h2: ({ children }) => (
    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 mt-5 mb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50 mt-4 mb-1">
      {children}
    </h3>
  ),
  ul: ({ children }) => <ul className="list-disc pl-6 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 space-y-0.5">{children}</ol>,
};

export const Route = createFileRoute('/admin/notes/$id/edit')({
  loader: async ({ params }) => {
    const { id } = params;
    if (id === 'new') return { note: null };
    const note = await getNoteById({ data: { id } });
    if (!note) throw notFound();
    return { note };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.note ? `Edit: ${loaderData.note.title}` : 'New Note' }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { note } = Route.useLoaderData();
  const navigate = useNavigate();

  const [title, setTitle] = useState(note?.title ?? '');
  const [slug, setSlug] = useState(note?.slug ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [tagsStr, setTagsStr] = useState(note?.tags.join(', ') ?? '');
  const [isPublished, setIsPublished] = useState(note?.isPublished ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activePane, setActivePane] = useState<'editor' | 'preview'>('editor');

  const isNew = id === 'new';

  const handleTogglePublished = () => {
    const next = !isPublished;
    const message = next
      ? 'この記事を公開しますか？'
      : 'この記事を下書きに戻しますか？';
    if (!window.confirm(message)) return;
    setIsPublished(next);
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      setSaveError('タイトルとスラッグは必須です');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await upsertNote({
        data: {
          id: isNew ? undefined : id,
          title: title.trim(),
          slug: slug.trim(),
          content,
          tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
          isPublished,
        },
      });
      navigate({ to: '/admin/notes' });
    } catch {
      setSaveError('保存に失敗しました。もう一度お試しください。');
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('この記事を削除しますか？この操作は取り消せません。')) return;
    try {
      await deleteNote({ data: { id } });
      navigate({ to: '/admin/notes' });
    } catch {
      setSaveError('削除に失敗しました。');
    }
  };

  const inputClass =
    'w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600';

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link
          to="/admin/notes"
          className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ChevronLeft size={14} />
          Admin Notes
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300">
          {isNew ? 'New Note' : (title || 'Edit')}
        </span>
      </nav>

      {/* Form fields */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(inputClass, 'text-base font-semibold placeholder:font-normal placeholder:font-sans placeholder:text-sm')}
        />
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={cn(inputClass, 'flex-1 min-w-40 font-mono text-xs placeholder:font-sans placeholder:text-sm')}
          />
          <input
            type="text"
            placeholder="Tags ( カンマ区切り )"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            className={cn(inputClass, 'flex-1 min-w-40')}
          />
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Published toggle */}
        <button
          type="button"
          onClick={handleTogglePublished}
          className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
          aria-pressed={isPublished}
        >
          <span
            className={cn(
              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
              isPublished
                ? 'bg-slate-900 dark:bg-slate-100'
                : 'bg-slate-200 dark:bg-slate-700',
            )}
          >
            <span
              className={cn(
                'inline-block h-3.5 w-3.5 transform rounded-full transition-transform',
                isPublished
                  ? 'translate-x-4 bg-white dark:bg-slate-900'
                  : 'translate-x-1 bg-slate-500 dark:bg-slate-400',
              )}
            />
          </span>
          <span>{isPublished ? 'Published' : 'Draft'}</span>
        </button>

        {/* View live page */}
        {!isNew && isPublished && slug && (
          <a
            href={`/notes/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ExternalLink size={14} />
            View Page
          </a>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {saveError && (
            <span className="text-xs text-red-500 dark:text-red-400">{saveError}</span>
          )}
          {!isNew && (
            <Button variant="secondary" size="sm" onClick={handleDelete}>
              <Trash2 size={14} />
              Delete
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save size={14} />
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Mobile pane tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 sm:hidden">
        {(['editor', 'preview'] as const).map((pane) => (
          <button
            key={pane}
            onClick={() => setActivePane(pane)}
            className={cn(
              'px-4 py-2 text-sm capitalize transition-colors',
              activePane === pane
                ? 'border-b-2 border-slate-900 dark:border-slate-100 font-medium text-slate-900 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
            )}
          >
            {pane}
          </button>
        ))}
      </div>

      {/* 2-pane editor — fixed height, each pane scrolls independently */}
      <div className="grid sm:grid-cols-2 gap-4 h-[calc(100vh-280px)] min-h-96">
        {/* Editor pane */}
        <div
          className={cn(
            'h-full overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl',
            activePane !== 'editor' && 'hidden sm:block',
          )}
        >
          <Suspense
            fallback={
              <div className="h-full animate-pulse bg-slate-100 dark:bg-slate-800" />
            }
          >
            <NoteEditor value={content} onChange={setContent} />
          </Suspense>
        </div>

        {/* Preview pane */}
        <div
          className={cn(
            'h-full overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-5',
            'space-y-5 text-[15px] text-slate-700 dark:text-slate-300 leading-7',
            activePane !== 'preview' && 'hidden sm:block',
          )}
        >
          {content ? (
            <MarkdownHooks
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[[rehypePrettyCode, prettyCodeOptions]]}
              components={previewComponents}
            >
              {content}
            </MarkdownHooks>
          ) : (
            <p className="text-slate-400 dark:text-slate-600 text-sm">
              プレビューがここに表示されます。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

