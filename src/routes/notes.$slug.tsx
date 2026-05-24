import { createFileRoute, notFound } from '@tanstack/react-router'
import NoteArticle from '@/components/notes/NoteArticle'
import { getPublishedNotePageBySlug } from '@/server/notes'

export const Route = createFileRoute('/notes/$slug')({
  loader: async ({ params }) => {
    const notePage = await getPublishedNotePageBySlug({ data: { slug: params.slug } })
    if (!notePage) {
      throw notFound()
    }
    return notePage
  },
  head: ({ loaderData }) => {
    const title = `${loaderData?.note.title ?? 'Notes'} - kazui.dev`
    const ogImage = loaderData?.note.title
      ? `https://og.kazui.dev/notes/?title=${encodeURIComponent(loaderData.note.title)}`
      : undefined

    return {
      meta: [
        { title },
        { name: 'description', content: '' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: '' },
        ...(ogImage ? [{ property: 'og:image', content: ogImage }] : []),
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: '' },
        ...(ogImage ? [{ name: 'twitter:image', content: ogImage }] : []),
      ],
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { note, renderedContentHtml, previousNote, nextNote } = Route.useLoaderData()

  return (
    <NoteArticle
      note={note}
      renderedContentHtml={renderedContentHtml}
      previousNote={previousNote}
      nextNote={nextNote}
    />
  )
}
