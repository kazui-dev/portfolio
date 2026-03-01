import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { X, Filter, ArrowUpDown, Plus, ExternalLink } from 'lucide-react';
import { getAllNotes } from '@/server/admin';
import NoteGrid from '@/components/notes/NoteGrid';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Note } from '@/db/schema';

type AdminNotesSearch = {
  tag?: string;
  status?: 'all' | 'published' | 'draft';
};

export const Route = createFileRoute('/admin/notes/')({
  validateSearch: (search: Record<string, unknown>): AdminNotesSearch => ({
    tag: typeof search.tag === 'string' ? search.tag : undefined,
    status:
      search.status === 'published' || search.status === 'draft'
        ? search.status
        : 'all',
  }),
  loader: async () => {
    const notes = await getAllNotes();
    return { notes };
  },
  head: () => ({
    meta: [{ title: 'Admin Notes' }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { tag, status = 'all' } = Route.useSearch();
  const { notes } = Route.useLoaderData();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const currentTags = useMemo(() => {
    if (!tag) return [];
    return tag.split('-').filter(Boolean);
  }, [tag]);

  const allTags = useMemo(
    () => Array.from(new Set(notes.flatMap((n) => n.tags))),
    [notes],
  );

  const tagOptions = useMemo(
    () => [
      { value: 'all', label: 'All Tags', exclusive: true },
      ...allTags.map((t) => ({ value: t, label: t })),
    ],
    [allTags],
  );

  const sortOptions = [
    { value: 'desc', label: 'Newest' },
    { value: 'asc', label: 'Oldest' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', exclusive: true },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
  ];

  const processedNotes = useMemo(() => {
    let filtered = notes;
    if (status === 'published') filtered = filtered.filter((n) => n.isPublished);
    if (status === 'draft') filtered = filtered.filter((n) => !n.isPublished);
    if (currentTags.length > 0)
      filtered = filtered.filter((n) => currentTags.every((t) => n.tags.includes(t)));
    return [...filtered].sort((a, b) => {
      const timeA = a.createdAt.getTime();
      const timeB = b.createdAt.getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [currentTags, sortOrder, notes, status]);

  const navigateSearch = (patch: Partial<AdminNotesSearch>) => {
    navigate({
      to: '/admin/notes',
      search: { tag, status, ...patch } as AdminNotesSearch,
    });
  };

  const handleTagChange = (values: string[]) => {
    if (values.includes('all') || values.length === 0) {
      navigateSearch({ tag: undefined });
    } else {
      navigateSearch({ tag: values.join('-') });
    }
  };

  const handleTagToggle = (t: string) => {
    if (currentTags.includes(t)) {
      const next = currentTags.filter((x) => x !== t);
      navigateSearch({ tag: next.length > 0 ? next.join('-') : undefined });
    } else {
      navigateSearch({ tag: [...currentTags, t].join('-') });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Admin Notes
        </h1>
        <Button asChild size="sm">
          <Link to="/admin/notes/$id/edit" params={{ id: 'new' }}>
            <Plus size={16} />
            New Note
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Status filter */}
        <div className="w-36">
          <Select
            options={statusOptions}
            value={status}
            onChange={(val) => navigateSearch({ status: val as AdminNotesSearch['status'] })}
            multiple={false}
          />
        </div>
        {/* Tag filter */}
        <div className="w-37.5">
          <Select
            options={tagOptions}
            value={currentTags.length > 0 ? currentTags : ['all']}
            onChange={handleTagChange}
            multiple={true}
            icon={<Filter size={14} />}
          />
        </div>
        {/* Sort */}
        <div className="w-32.5">
          <Select
            options={sortOptions}
            value={sortOrder}
            onChange={(val) => setSortOrder(val as 'desc' | 'asc')}
            multiple={false}
            icon={<ArrowUpDown size={14} />}
          />
        </div>
        {currentTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 ml-1 sm:ml-2">
            <span className="text-sm font-medium text-slate-500">Filtered by:</span>
            {currentTags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-50 dark:bg-slate-200 dark:text-slate-900"
              >
                #{t}
                <button
                  onClick={() => handleTagToggle(t)}
                  className="ml-0.5 focus:outline-none hover:text-slate-300 dark:hover:text-slate-400 transition-colors"
                  aria-label={`Remove ${t} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <NoteGrid
        notes={processedNotes}
        currentTags={currentTags}
        onTagToggle={handleTagToggle}
        renderNoteLink={(note: Note, children) => (
          <Link
            to="/admin/notes/$id/edit"
            params={{ id: note.id }}
            className="before:absolute before:inset-0"
          >
            {children}
          </Link>
        )}
        renderNoteActions={(note: Note) =>
          note.isPublished ? (
            <a
              href={`/notes/${note.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              aria-label="公開ページを開く"
            >
              <ExternalLink size={11} />
            </a>
          ) : null
        }
        showStatus={true}
      />
    </div>
  );
}

