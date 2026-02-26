import { createFileRoute } from '@tanstack/react-router'
import Home from '@/components/home/Home'
import { PAGE_METADATA } from '@/constants/metadata'
import { getPublishedNotes } from '@/server/notes'

export const Route = createFileRoute('/')({
  loader: async () => {
    const fetchedNotes = await getPublishedNotes();
    return { notes: fetchedNotes };
  },
  head: () => ({
    meta: [
      { title: PAGE_METADATA.home.title },
      { name: 'description', content: PAGE_METADATA.home.description },
      { property: 'og:title', content: PAGE_METADATA.home.ogTitle || PAGE_METADATA.home.title },
      { property: 'og:description', content: PAGE_METADATA.home.ogDescription || PAGE_METADATA.home.description },
      { name: 'twitter:title', content: PAGE_METADATA.home.ogTitle },
      { name: 'twitter:description', content: PAGE_METADATA.home.description },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(PAGE_METADATA.home.jsonLd),
      },
    ],
  }),
  component: IndexPage,
})

function IndexPage() {
  const { notes } = Route.useLoaderData()
  return <Home notes={notes} />
}