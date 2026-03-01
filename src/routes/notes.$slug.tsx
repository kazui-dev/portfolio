import { createFileRoute, notFound } from '@tanstack/react-router'
import NoteArticle from '@/components/notes/NoteArticle'
import { getPublishedNoteBySlug, getPublishedNotes } from '@/server/notes'
import type { Note } from '@/db/schema'

const ARTICLE_META_FALLBACK = 'Notes article'

function createArticleDescription(content: string) {
  return content.replace(/[#*_`>\-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 70)
}

export const Route = createFileRoute('/notes/$slug')({
  loader: async ({ params }) => {
    const [note, allNotes] = await Promise.all([
      getPublishedNoteBySlug({ data: { slug: params.slug } }),
      getPublishedNotes(),
    ])

    if (!note) {
      throw notFound()
    }

    const index = allNotes.findIndex((item) => item.slug === note.slug)
    const previousNote = index > 0 ? allNotes[index - 1] : null
    const nextNote = index >= 0 && index < allNotes.length - 1 ? allNotes[index + 1] : null

    return {
      note,
      previousNote: previousNote ? toNavigationNote(previousNote) : null,
      nextNote: nextNote ? toNavigationNote(nextNote) : null,
    }
  },
  head: ({ loaderData }) => {
    const title = `${loaderData?.note.title ?? 'Notes'} - kazui.dev`
    const description = createArticleDescription(loaderData?.note.content ?? '')
    const ogImage = loaderData?.note.title
      ? `https://og.kazui.dev/?title=${encodeURIComponent(loaderData.note.title)}`
      : undefined

    return {
      meta: [
        { title },
        { name: 'description', content: description || ARTICLE_META_FALLBACK },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description || ARTICLE_META_FALLBACK },
        ...(ogImage ? [{ property: 'og:image', content: ogImage }] : []),
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description || ARTICLE_META_FALLBACK },
        ...(ogImage ? [{ name: 'twitter:image', content: ogImage }] : []),
      ],
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { note, previousNote, nextNote } = Route.useLoaderData()

  return <NoteArticle note={note} previousNote={previousNote} nextNote={nextNote} />
}

function toNavigationNote(note: Note) {
  return {
    slug: note.slug,
    title: note.title,
    excerpt: createNavigationExcerpt(note.content),
  }
}

function createNavigationExcerpt(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 70)
}
