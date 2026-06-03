import type { Components } from 'react-markdown'
import { cn } from '@/lib/utils'
import { createHeadingIdFactory, getTextFromNode, type TocItem } from './toc'

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
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt ?? ''}
      loading="lazy"
      className="block w-full max-w-[70%] sm:max-w-[45%] ml-0 mr-auto my-6 rounded-xl border border-slate-200 dark:border-slate-800"
    />
  ),
}

export function createNoteMarkdownComponents(tocItems: TocItem[]): Components {
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
}
