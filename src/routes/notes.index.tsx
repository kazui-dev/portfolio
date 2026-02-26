import { createFileRoute } from '@tanstack/react-router'
import Notes from '@/components/notes/Notes'
import { PAGE_METADATA } from '@/constants/metadata'

type NotesSearch = {
  tag?: string | string[]
}

export const Route = createFileRoute('/notes/')({
  validateSearch: (search: Record<string, unknown>): NotesSearch => {
    return {
      tag: Array.isArray(search.tag) 
        ? search.tag.filter(t => typeof t === 'string') 
        : typeof search.tag === 'string' 
          ? search.tag 
          : undefined,
    }
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
  // 💡 3. 検証済みのパラメータ（今回は tag）を取得
  const { tag } = Route.useSearch()

  // 💡 4. UIコンポーネントに props として渡す！
  return <Notes selectedTag={tag} />
}