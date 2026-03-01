import { createFileRoute } from '@tanstack/react-router'

function estimateCharWidth(ch: string, fontSize: number): number {
  const code = ch.codePointAt(0) ?? 0
  const isCJK =
    (code >= 0x3000 && code <= 0x9fff) ||
    (code >= 0xac00 && code <= 0xd7af) ||
    (code >= 0xff00 && code <= 0xffef)
  if (isCJK) return fontSize * 0.85
  if (ch === ' ') return fontSize * 0.25
  return fontSize * 0.48
}

function wrapLines(text: string, maxWidth: number, fontSize: number): string[] {
  const tokens: string[] = []
  let buf = ''
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0
    const isCJK =
      (code >= 0x3000 && code <= 0x9fff) ||
      (code >= 0xac00 && code <= 0xd7af) ||
      (code >= 0xff00 && code <= 0xffef)
    if (ch === ' ') {
      if (buf) { tokens.push(buf); buf = '' }
      tokens.push(' ')
    } else if (isCJK) {
      if (buf) { tokens.push(buf); buf = '' }
      tokens.push(ch)
    } else {
      buf += ch
    }
  }
  if (buf) tokens.push(buf)

  const lines: string[] = []
  let line = ''
  let lineW = 0

  for (const token of tokens) {
    const tw = token.split('').reduce((s, c) => s + estimateCharWidth(c, fontSize), 0)
    if (token === ' ') {
      if (line) { line += ' '; lineW += tw }
    } else if (lineW + tw > maxWidth && line) {
      lines.push(line.trimEnd())
      line = token
      lineW = tw
    } else {
      line += token
      lineW += tw
    }
  }
  if (line.trim()) lines.push(line.trim())
  return lines
}

function buildSvg(title: string) {
  const fontSize = title.length > 100 ? 44 : title.length > 60 ? 54 : 64
  const escaped = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const cardPad = 80
  const cardX = 48
  const cardY = 48
  const cardW = 1104
  const maxTextWidth = cardW - cardPad * 2  // 944px
  const titleX = cardX + cardPad
  const titleY = cardY + cardPad + fontSize

  const lines = wrapLines(escaped, maxTextWidth, fontSize)
  const lineHeight = fontSize * 1.4
  const textLines = lines
    .map((line, i) => `<text x="${titleX}" y="${titleY + i * lineHeight}" font-size="${fontSize}" font-family="Inter,system-ui,sans-serif" fill="#111111" font-weight="600">${line}</text>`)
    .join('\n  ')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#808080"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="534" rx="24" ry="24" fill="#ffffff"/>
  ${textLines}
  <text x="${cardX + cardW - cardPad}" y="${cardY + 534 - cardPad}" font-size="64" font-weight="800" font-family="Inter,system-ui,sans-serif" fill="#888888" text-anchor="end" letter-spacing="-2">kazui.dev</text>
</svg>`
}

export const Route = createFileRoute('/api/og')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const title = url.searchParams.get('title') ?? 'kazui.dev'
        const svg = buildSvg(title)

        if (import.meta.env.DEV) {
          return new Response(svg, {
            headers: { 'Content-Type': 'image/svg+xml' },
          })
        }

        try {
          const { Resvg } = await import('@cf-wasm/resvg')
          const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
          const png = resvg.render().asPng()

          return new Response(png.buffer as ArrayBuffer, {
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            },
          })
        } catch (error) {
          return new Response(svg, {
            headers: { 'Content-Type': 'image/svg+xml' },
          })
        }
      },
    },
  },
  component: () => null,
})

