import { MarkdownAsync } from 'react-markdown';
import { renderToStaticMarkup } from 'react-dom/server';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypePrettyCode from 'rehype-pretty-code';
import { createHighlighter, createJavaScriptRegexEngine } from 'shiki';
import { createNoteMarkdownComponents, normalizeNoteMarkdown, prettyCodeOptions } from '@/components/notes/noteMarkdown';
import { extractTocItemsFromMarkdown } from '@/components/notes/toc';

const workerCompatiblePrettyCodeOptions = {
  ...prettyCodeOptions,
  getHighlighter: (options: Parameters<typeof createHighlighter>[0]) =>
    createHighlighter({
      ...options,
      engine: createJavaScriptRegexEngine(),
    }),
};

export async function renderNoteContentToHtml(content: string) {
  const normalizedContent = normalizeNoteMarkdown(content);
  const tocItems = extractTocItemsFromMarkdown(normalizedContent);
  const components = createNoteMarkdownComponents(tocItems);
  const rendered = await MarkdownAsync({
    children: normalizedContent,
    remarkPlugins: [remarkGfm, remarkBreaks],
    rehypePlugins: [[rehypePrettyCode, workerCompatiblePrettyCodeOptions]],
    components,
  });

  return renderToStaticMarkup(rendered);
}
