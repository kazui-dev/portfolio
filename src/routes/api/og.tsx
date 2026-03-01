import { createFileRoute } from '@tanstack/react-router'

function buildSvgFallback(title: string) {
  const fontSize = title.length > 40 ? 40 : title.length > 24 ? 52 : 64
  const escaped = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Wrap text manually for SVG (approx chars per line based on font size)
  const charsPerLine = Math.floor(1000 / (fontSize * 0.55))
  const words = escaped.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > charsPerLine) {
      if (current) lines.push(current)
      current = word
    } else {
      current = (current + ' ' + word).trim()
    }
  }
  if (current) lines.push(current)

  const lineHeight = fontSize * 1.4
  const titleY = 56 + 32 + fontSize
  const textLines = lines
    .map((line, i) => `<text x="64" y="${titleY + i * lineHeight}" font-size="${fontSize}" font-family="Inter,system-ui,sans-serif" fill="#111111" font-weight="600">${line}</text>`)
    .join('\n  ')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#808080"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="48" y="48" width="1104" height="534" rx="24" ry="24" fill="#ffffff"/>
  ${textLines}
  <text x="1136" y="558" font-size="22" font-family="Inter,system-ui,sans-serif" fill="#888888" text-anchor="end">kazui.dev</text>
</svg>`
}

export const Route = createFileRoute('/api/og')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const title = url.searchParams.get('title') ?? 'kazui.dev'
        const origin = url.origin

        // In dev, Vite pre-bundles WASM packages in a way that CF workerd blocks.
        // Return an SVG fallback that renders correctly in the browser.
        if (import.meta.env.DEV) {
          return new Response(buildSvgFallback(title), {
            headers: { 'Content-Type': 'image/svg+xml' },
          })
        }

        try {
          const { generateOgImage } = await import('@/server/og-generate')
          const png = await generateOgImage(title, origin)

          return new Response(png.buffer as ArrayBuffer, {
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            },
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          console.error('OG image generation error:', err)
          // Fallback to SVG on error
          return new Response(buildSvgFallback(title), {
            headers: { 'Content-Type': 'image/svg+xml' },
          })
        }
      },
    },
  },
  component: () => null,
})
