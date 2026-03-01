import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MarkdownHooks } from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import type { Note } from '@/db/schema'
import { cn } from '@/lib/utils'
import NotesToc from './NotesToc'
import { createHeadingIdFactory, extractTocItemsFromMarkdown, getTextFromNode } from './toc'

type NavigationNote = {
  slug: string
  title: string
  excerpt: string
}

export const prettyCodeOptions = {
  theme: {
    light: 'github-light',
    dark: 'github-dark',
  },
  keepBackground: false,
} as const

export const baseMarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 mt-10 first:mt-0 mb-4">
      {children}
    </h1>
  ),
  p: ({ children }) => <p className="leading-7">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-6 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 space-y-0.5">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  a: ({ href, children }) => {
    const isExternal = href?.startsWith('http')

    return (
      <a
        href={href}
        className="underline underline-offset-4 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  },
  code: ({ node, children, className, ...props }) => {
    const hasDataLanguage =
      typeof (node as { properties?: Record<string, unknown> } | undefined)?.properties?.['data-language'] ===
      'string'
    const codeText = Array.isArray(children) ? children.join('') : String(children ?? '')
    const isBlock = Boolean(className?.includes('language-') || hasDataLanguage || codeText.includes('\n'))

    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }

    return (
      <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-sm text-slate-800 dark:text-slate-200">
        {children}
      </code>
    )
  },
  pre: ({ children, className, ...props }) => (
    <pre
      {...props}
      className={cn(
        'overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-sm leading-6 [&_.line]:block',
        className,
      )}
    >
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-slate-300 dark:border-slate-700">{children}</thead>,
  th: ({ children }) => <th className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-200">{children}</th>,
  td: ({ children }) => <td className="px-3 py-2 border-t border-slate-200 dark:border-slate-800">{children}</td>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-slate-300 dark:border-slate-700 pl-4 italic text-slate-600 dark:text-slate-400">
      {children}
    </blockquote>
  ),
}

function formatPublishedDate(date: Date) {
  return date.toLocaleDateString('ja-JP').replace(/\//g, '.')
}

export default function NoteArticle({
  note,
  previousNote,
  nextNote,
}: {
  note: Note
  previousNote: NavigationNote | null
  nextNote: NavigationNote | null
}) {
  const tocItems = useMemo(() => extractTocItemsFromMarkdown(note.content), [note.content])

  const markdownComponents = useMemo<Components>(() => {
    const fallbackCreateHeadingId = createHeadingIdFactory()
    let headingIndex = 0

    const getNextHeadingId = (text: string) => {
      const fromToc = tocItems[headingIndex]
      headingIndex += 1

      if (fromToc) {
        return fromToc.id
      }

      return fallbackCreateHeadingId(text)
    }

    return {
      ...baseMarkdownComponents,
      h2: ({ children }) => {
        const text = getTextFromNode(children)
        const id = getNextHeadingId(text)

        return (
          <h2 id={id} className="scroll-mt-24 text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 mt-8 mb-3">
            {children}
          </h2>
        )
      },
      h3: ({ children }) => {
        const text = getTextFromNode(children)
        const id = getNextHeadingId(text)

        return (
          <h3 id={id} className="scroll-mt-24 text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">
            {children}
          </h3>
        )
      },
    }
  }, [note.content, tocItems])

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

        <header className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            {note.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {note.publishedAt ? (
              <time className="text-slate-500 dark:text-slate-400">{formatPublishedDate(note.publishedAt)}</time>
            ) : null}
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

        <div className="space-y-5 text-[15px] text-slate-700 dark:text-slate-300 leading-7">
          <MarkdownHooks
            fallback={
              <div className="min-h-[45vh]">
                <p className="text-sm text-slate-500 dark:text-slate-400">本文を読み込み中...</p>
              </div>
            }
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypePrettyCode, prettyCodeOptions]]}
            components={markdownComponents}
          >
            {note.content}
          </MarkdownHooks>
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