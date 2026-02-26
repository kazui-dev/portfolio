import { createFileRoute } from '@tanstack/react-router'
import Notes from '@/components/notes/Notes'
import { PAGE_METADATA } from '@/constants/metadata'

export const Route = createFileRoute('/notes/')({
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
  return <Notes />
}