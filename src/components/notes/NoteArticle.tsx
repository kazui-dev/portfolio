import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Note } from '@/db/schema'
import NotesToc from './NotesToc'
import { extractTocItemsFromMarkdown } from './toc'

type NavigationNote = {
  slug: string
  title: string
  excerpt: string
}

function formatDate(date: Date) {
  return date.toLocaleDateString('ja-JP').replace(/\//g, '.')
}

export default function NoteArticle({
  note,
  renderedContentHtml,
  previousNote,
  nextNote,
}: {
  note: Note
  renderedContentHtml: string
  previousNote: NavigationNote | null
  nextNote: NavigationNote | null
}) {
  const tocItems = useMemo(() => extractTocItemsFromMarkdown(note.content), [note.content])

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_240px] xl:gap-10">
      <article className="space-y-8 min-w-0">
        <nav className="text-sm text-slate-500 dark:text-slate-400">
          <Link
            to="/notes"
            className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Notes
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 dark:text-slate-200">{note.title}</span>
        </nav>

        {/* <header className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6"> */}
        <header className="space-y-3 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight wrap-break-words">
            {note.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {note.updatedAt.getTime() !== note.publishedAt?.getTime() ? (
              <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Last Updated</span>
                <time>{formatDate(note.updatedAt)}</time>
              </span>
            ) : null}
            {note.publishedAt ? (
              <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Published</span>
                <time>{formatDate(note.publishedAt)}</time>
              </span>
            ) : null}
            {note.isUnlisted && note.isPublished && (
              <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                限定公開
              </span>
            )}
            {note.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] font-bold tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        <div className="space-y-5 text-[15px] text-slate-700 dark:text-slate-200 leading-7 wrap-break-words">
          <div dangerouslySetInnerHTML={{ __html: renderedContentHtml }} />
        </div>

        <footer className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="grid gap-3 sm:grid-cols-2">
            {previousNote ? (
              <Link
                to="/notes/$slug"
                params={{ slug: previousNote.slug }}
                className="block rounded-lg border border-slate-200 dark:border-slate-800 p-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <p className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <ChevronLeft size={14} />
                  Previous
                </p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-2">
                  {previousNote.title}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {previousNote.excerpt}
                </p>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}

            {nextNote ? (
              <Link
                to="/notes/$slug"
                params={{ slug: nextNote.slug }}
                className="block rounded-lg border border-slate-200 dark:border-slate-800 p-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <p className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Next
                  <ChevronRight size={14} />
                </p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-2">
                  {nextNote.title}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {nextNote.excerpt}
                </p>
              </Link>
            ) : null}
          </div>
        </footer>
      </article>

      <NotesToc items={tocItems} />
    </div>
  )
}
