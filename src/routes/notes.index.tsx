import { createFileRoute } from '@tanstack/react-router'
import Notes from '@/components/notes/Notes'
import { PAGE_METADATA } from '@/constants/metadata'
import { getPublishedNotes } from '@/server/notes'

type NotesSearch = {
  tag?: string
}

export const Route = createFileRoute('/notes/')({
  validateSearch: (search: Record<string, unknown>): NotesSearch => {
    return {
      tag: typeof search.tag === 'string' ? search.tag : undefined,
    }
  },
  loader: async () => {
    const fetchedNotes = await getPublishedNotes();
    return { notes: fetchedNotes };
  },
  head: () => ({
    meta: [
      { title: PAGE_METADATA.notes.title },
      { name: 'description', content: PAGE_METADATA.notes.description },
      { property: 'og:title', content: PAGE_METADATA.notes.ogTitle || PAGE_METADATA.notes.title },
      { property: 'og:description', content: PAGE_METADATA.notes.ogDescription || PAGE_METADATA.notes.description },
      { name: 'twitter:title', content: PAGE_METADATA.notes.ogTitle },
      { name: 'twitter:description', content: PAGE_METADATA.notes.description },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(PAGE_METADATA.notes.jsonLd),
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { tag } = Route.useSearch()
  const { notes } = Route.useLoaderData()
  return <Notes selectedTag={tag} initialNotes={notes} />
}