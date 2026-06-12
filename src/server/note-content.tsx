import { MarkdownAsync } from 'react-markdown';
import { renderToStaticMarkup } from 'react-dom/server';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypePrettyCode from 'rehype-pretty-code';
import { createHighlighter, createJavaScriptRegexEngine } from 'shiki';
import { createNoteMarkdownComponents, prettyCodeOptions, remarkImageWidthHint } from '@/components/notes/noteMarkdown';
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
  const tocItems = extractTocItemsFromMarkdown(content);
  const components = createNoteMarkdownComponents(tocItems);
  const rendered = await MarkdownAsync({
    children: content,
    remarkPlugins: [remarkGfm, remarkBreaks, remarkImageWidthHint],
    rehypePlugins: [[rehypePrettyCode, workerCompatiblePrettyCodeOptions]],
    components,
  });

  return renderToStaticMarkup(rendered);
}