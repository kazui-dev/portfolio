import { MarkdownAsync } from 'react-markdown';
import { renderToStaticMarkup } from 'react-dom/server';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypePrettyCode from 'rehype-pretty-code';
import { createNoteMarkdownComponents, prettyCodeOptions } from '@/components/notes/noteMarkdown';
import { extractTocItemsFromMarkdown } from '@/components/notes/toc';

export async function renderNoteContentToHtml(content: string) {
  const tocItems = extractTocItemsFromMarkdown(content);
  const components = createNoteMarkdownComponents(tocItems);
  const rendered = await MarkdownAsync({
    children: content,
    remarkPlugins: [remarkGfm, remarkBreaks],
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
    components,
  });

  return renderToStaticMarkup(rendered);
}
