import { createFileRoute, notFound, useNavigate, Link } from '@tanstack/react-router';
import { useState, useCallback, Suspense, lazy, useRef, type ChangeEvent } from 'react';
import { MarkdownHooks } from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypePrettyCode from 'rehype-pretty-code';
import { ChevronLeft, Save, Trash2, ExternalLink, Image, ImagePlus, Loader2 } from 'lucide-react';
import { getNoteById, upsertNote, deleteNote, uploadNoteImage } from '@/server/admin';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { baseMarkdownComponents, prettyCodeOptions } from '@/components/notes/noteMarkdown';
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

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_OPTIMIZATION_QUALITY = 0.82;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
]);
const OPTIMIZABLE_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const IMAGE_EXTENSION_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
  svg: 'image/svg+xml',
};

function inferImageMimeType(file: File) {
  if (file.type) return file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  const ext = file.name.trim().split('.').at(-1)?.toLowerCase();
  return ext ? IMAGE_EXTENSION_TO_MIME[ext] : undefined;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function supportsWebpEncoding() {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

function getOptimizedMimeType(sourceMimeType: string) {
  if (supportsWebpEncoding()) return 'image/webp';
  return sourceMimeType === 'image/png' ? 'image/png' : 'image/jpeg';
}

function replaceFileExtension(fileName: string, extension: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  return `${baseName || 'image'}.${extension}`;
}

async function loadImageElement(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const image = document.createElement('img');
  image.decoding = 'async';
  image.src = objectUrl;

  try {
    await image.decode();
  } catch {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('画像の読み込みに失敗しました。'));
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return image;
}

async function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });
}

async function optimizeImageFile(file: File, mimeType: string) {
  if (typeof document === 'undefined' || !OPTIMIZABLE_IMAGE_MIME_TYPES.has(mimeType)) {
    return { file, mimeType };
  }

  const targetMimeType = getOptimizedMimeType(mimeType);
  const image = typeof createImageBitmap === 'function'
    ? await createImageBitmap(file)
    : await loadImageElement(file);
  const isHtmlImage = 'naturalWidth' in image;
  const sourceWidth = isHtmlImage ? image.naturalWidth : image.width;
  const sourceHeight = isHtmlImage ? image.naturalHeight : image.height;
  const maxDimension = Math.max(sourceWidth, sourceHeight);
  const scale = maxDimension > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / maxDimension : 1;
  const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale));
  const shouldResize = targetWidth !== sourceWidth || targetHeight !== sourceHeight;

  if (!shouldResize && targetMimeType === mimeType) {
    if ('close' in image) image.close();
    return { file, mimeType };
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d', { alpha: true });

  if (!context) {
    if ('close' in image) image.close();
    return { file, mimeType };
  }

  context.drawImage(image as CanvasImageSource, 0, 0, targetWidth, targetHeight);
  if ('close' in image) image.close();

  const blob = await canvasToBlob(canvas, targetMimeType, IMAGE_OPTIMIZATION_QUALITY);
  if (!blob) {
    return { file, mimeType };
  }

  const extension = targetMimeType.split('/').at(-1) ?? 'webp';
  const optimizedFile = new File([blob], replaceFileExtension(file.name, extension), { type: targetMimeType });
  if (!shouldResize && blob.size >= file.size) {
    return { file, mimeType };
  }

  return { file: optimizedFile, mimeType: targetMimeType };
}

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
  const [isUnlisted, setIsUnlisted] = useState(note?.isUnlisted ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);
  const [activePane, setActivePane] = useState<'editor' | 'preview'>('editor');
  const [showOgPreview, setShowOgPreview] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const editorSelectionRef = useRef<{ from: number; to: number } | null>(null);

  const isNew = id === 'new';

  const handleTogglePublished = () => {
    const next = !isPublished;
    const message = next
      ? 'この記事を公開しますか？'
      : 'この記事を下書きに戻しますか？';
    if (!window.confirm(message)) return;
    setIsPublished(next);
  };

  const handleEditorSelectionChange = useCallback((selection: { from: number; to: number }) => {
    editorSelectionRef.current = selection;
  }, []);

  const insertMarkdownAtSelection = useCallback((markdown: string) => {
    setContent((current) => {
      const selection = editorSelectionRef.current;
      const length = current.length;
      const from = clamp(selection?.from ?? length, 0, length);
      const to = clamp(selection?.to ?? length, 0, length);
      const before = current.slice(0, from);
      const after = current.slice(to);

      const leading = before
        ? before.endsWith('\n\n')
          ? ''
          : before.endsWith('\n')
            ? '\n'
            : '\n\n'
        : '';
      const trailing = after
        ? after.startsWith('\n')
          ? ''
          : '\n'
        : '\n';

      return `${before}${leading}${markdown}${trailing}${after}`;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !slug.trim()) {
      setSaveError('タイトルとスラッグは必須です');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const result = await upsertNote({
        data: {
          id: isNew ? undefined : id,
          title: title.trim(),
          slug: slug.trim(),
          content,
          tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
          isPublished,
          isUnlisted: isPublished ? isUnlisted : false,
        },
      });
      setSavedOnce(true);
      if (isNew) {
        navigate({ to: '/admin/notes/$id/edit', params: { id: result.id }, replace: true });
      }
    } catch {
      setSaveError('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  }, [title, slug, content, tagsStr, isPublished, isUnlisted, isNew, id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('この記事を削除しますか？この操作は取り消せません。')) return;
    try {
      await deleteNote({ data: { id } });
      navigate({ to: '/admin/notes' });
    } catch {
      setSaveError('削除に失敗しました。');
    }
  };

  const handleClickInsertImage = () => {
    imageInputRef.current?.click();
  };

  const handleImageSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';
    if (!selectedFile) {
      return;
    }

    const mimeType = inferImageMimeType(selectedFile);
    if (!mimeType || !ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
      setImageUploadError('サポート外の画像形式です。jpg / png / webp / gif / avif / svg を使用してください。');
      return;
    }

    setIsUploadingImage(true);
    setImageUploadError(null);

    try {
      const { file: optimizedFile, mimeType: optimizedMimeType } = await optimizeImageFile(selectedFile, mimeType);
      if (optimizedFile.size > MAX_IMAGE_SIZE_BYTES) {
        setImageUploadError('画像サイズが大きすぎます。10MB以下にしてください。');
        return;
      }

      const uploaded = await uploadNoteImage({
        data: {
          fileName: optimizedFile.name,
          mimeType: optimizedMimeType,
          base64Data: await fileToBase64(optimizedFile),
          noteId: isNew ? undefined : id,
          noteSlug: slug.trim() || undefined,
        },
      });

      insertMarkdownAtSelection(uploaded.markdown);
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : '画像アップロードに失敗しました。R2設定と公開URLを確認してください。';
      setImageUploadError(message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const inputClass =
    'w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600';

  return (
    <div className="space-y-4">
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

      <div className="space-y-3">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelected}
        />
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

      <div className="flex flex-wrap items-center gap-3">
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
        <button
          type="button"
          onClick={() => isPublished && setIsUnlisted((v) => !v)}
          className={cn(
            'flex items-center gap-2 text-sm',
            isPublished ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600 cursor-not-allowed',
          )}
          aria-pressed={isUnlisted && isPublished}
          disabled={!isPublished}
        >
          <span
            className={cn(
              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
              isUnlisted && isPublished
                ? 'bg-slate-700 dark:bg-slate-200'
                : 'bg-slate-200 dark:bg-slate-700',
            )}
          >
            <span
              className={cn(
                'inline-block h-3.5 w-3.5 transform rounded-full transition-transform',
                isUnlisted && isPublished
                  ? 'translate-x-4 bg-white dark:bg-slate-900'
                  : 'translate-x-1 bg-slate-500 dark:bg-slate-400',
              )}
            />
          </span>
          <span>Unlisted</span>
        </button>

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

        {title && (
          <button
            type="button"
            onClick={() => setShowOgPreview((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Image size={14} />
            OG Preview
          </button>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={handleClickInsertImage}
          disabled={isUploadingImage}
        >
          {isUploadingImage ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          {isUploadingImage ? 'Uploading…' : 'Insert Image'}
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          {imageUploadError && (
            <span className="text-xs text-red-500 dark:text-red-400">{imageUploadError}</span>
          )}
          {saveError && (
            <span className="text-xs text-red-500 dark:text-red-400">{saveError}</span>
          )}
          {!saveError && savedOnce && !isSaving && (
            <span className="text-xs text-slate-400 dark:text-slate-500">Saved</span>
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

      <Dialog open={showOgPreview} onOpenChange={setShowOgPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-medium">
              <Image size={14} />
              OG Image Preview
            </DialogTitle>
          </DialogHeader>
          <img
            key={title}
            src={`https://og.kazui.dev/notes/?title=${encodeURIComponent(title)}`}
            alt="OG image preview"
            className="w-full rounded-lg"
            style={{ aspectRatio: '1200 / 630' }}
          />
        </DialogContent>
      </Dialog>

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

      <div className="grid sm:grid-cols-2 gap-4 h-[calc(100vh-280px)] min-h-96">
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
            <NoteEditor
              value={content}
              onChange={setContent}
              onSave={handleSave}
              onSelectionChange={handleEditorSelectionChange}
            />
          </Suspense>
        </div>

        <div
          className={cn(
            'h-full overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-5',
            'space-y-5 text-[15px] text-slate-700 dark:text-slate-200 leading-7',
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

async function fileToBase64(file: Blob) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}
