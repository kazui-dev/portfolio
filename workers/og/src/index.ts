import { Resvg } from '@cf-wasm/resvg'

let fontsCache: Uint8Array[] | null = null

async function getFonts(): Promise<Uint8Array[]> {
  if (fontsCache) return fontsCache

  const ua = 'Mozilla/5.0 (compatible; bot)'
  const [interRes, notoRes] = await Promise.all([
    fetch('https://fonts.googleapis.com/css2?family=Inter:wght@800&display=swap', { headers: { 'User-Agent': ua } }),
    fetch('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap', { headers: { 'User-Agent': ua } }),
  ])
  const [interCss, notoCss] = await Promise.all([interRes.text(), notoRes.text()])

  const urlPattern = /url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g
  const urls: string[] = []
  for (const css of [interCss, notoCss]) {
    let m: RegExpExecArray | null
    while ((m = urlPattern.exec(css)) !== null) urls.push(m[1])
  }

  const buffers = await Promise.all(
    urls.map(u => fetch(u).then(r => r.arrayBuffer()).then(b => new Uint8Array(b)))
  )
  fontsCache = buffers
  return fontsCache
}

function isCJKChar(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0
  return (
    (code >= 0x3000 && code <= 0x9fff) ||
    (code >= 0xac00 && code <= 0xd7af) ||
    (code >= 0xff00 && code <= 0xffef)
  )
}

function estimateCharWidth(ch: string, fontSize: number): number {
  if (isCJKChar(ch)) return fontSize * 1.0
  if (ch === ' ') return fontSize * 0.25
  return fontSize * 0.55
}

function wrapLines(text: string, maxWidth: number, fontSize: number): string[] {
  const lines: string[] = []
  let line = ''
  let lineW = 0

  for (const ch of text) {
    if (ch === ' ' && line === '') continue
    const tw = estimateCharWidth(ch, fontSize)
    if (lineW + tw > maxWidth && line) {
      lines.push(line.trimEnd())
      line = ch === ' ' ? '' : ch
      lineW = ch === ' ' ? 0 : tw
    } else {
      line += ch
      lineW += tw
    }
  }
  if (line.trim()) lines.push(line.trim())
  return lines
}

function renderLine(line: string, x: number, y: number, fontSize: number): string {
  return `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="'Noto Sans JP',sans-serif" fill="#111111" font-weight="700">${line}</text>`
}

function buildSvg(title: string): string {
  const fontSize = title.length > 100 ? 44 : title.length > 60 ? 54 : 64

  const cardPad = 80
  const cardX = 28
  const cardY = 28
  const cardW = 1144
  const cardH = 574
  const maxTextWidth = cardW - cardPad * 2
  const titleX = cardX + cardPad
  const titleY = cardY + cardPad + fontSize

  const lines = wrapLines(title, maxTextWidth, fontSize)
  const lineHeight = fontSize * 1.4
  const textLines = lines
    .map((line, i) => renderLine(line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), titleX, titleY + i * lineHeight, fontSize))
    .join('\n  ')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#808080"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="20" ry="20" fill="#ffffff"/>
  ${textLines}
  <text x="${cardX + cardW - cardPad}" y="${cardY + cardH - cardPad}" font-size="64" font-weight="800" font-family="Inter,system-ui,sans-serif" fill="#888888" text-anchor="end" letter-spacing="-2">kazui.dev</text>
</svg>`
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    const url = new URL(request.url)
    const title = url.searchParams.get('title') ?? 'kazui.dev'
    const svg = buildSvg(title)

    try {
      const fonts = await getFonts()
      const resvg = new Resvg(svg, {
        fitTo: { mode: 'width', value: 1200 },
        font: { fontBuffers: fonts },
      })
      const png = resvg.render().asPng()

      return new Response(png.buffer as ArrayBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'Access-Control-Allow-Origin': 'https://kazui.dev',
        },
      })
    } catch (error) {
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': 'https://kazui.dev',
        },
      })
    }
  },
}
