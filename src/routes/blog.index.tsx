import { createFileRoute } from '@tanstack/react-router'
import Blog from '@/components/blog/Blog'
import { PAGE_METADATA } from '@/constants/metadata'

export const Route = createFileRoute('/blog/')({
  head: () => ({
    meta: [
      { title: PAGE_METADATA.blog.title },
      { name: 'description', content: PAGE_METADATA.blog.description },
      { property: 'og:title', content: PAGE_METADATA.blog.ogTitle || PAGE_METADATA.blog.title },
      { property: 'og:description', content: PAGE_METADATA.blog.ogDescription || PAGE_METADATA.blog.description },
      { name: 'twitter:title', content: PAGE_METADATA.blog.ogTitle },
      { name: 'twitter:description', content: PAGE_METADATA.blog.description },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(PAGE_METADATA.blog.jsonLd),
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <Blog />
}