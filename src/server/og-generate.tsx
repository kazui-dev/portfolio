import satori, { init as initSatori } from 'satori'
import { initWasm as initResvg, Resvg } from '@resvg/resvg-wasm'
import yogaWasm from '../../public/yoga.wasm'
import resvgWasm from '../../public/resvg.wasm'

let initPromise: Promise<void> | null = null
let fontsPromise: Promise<ArrayBuffer[]> | null = null

function ensureInit() {
  if (!initPromise) {
    initPromise = Promise.all([
      initSatori(yogaWasm),
      initResvg(resvgWasm),
    ]).then(() => undefined)
  }
  return initPromise
}

function ensureFonts(origin: string) {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetch(`${origin}/fonts/inter-400.woff`).then((r) => r.arrayBuffer()),
      fetch(`${origin}/fonts/inter-600.woff`).then((r) => r.arrayBuffer()),
      fetch(`${origin}/fonts/noto-sans-jp-400.woff`).then((r) => r.arrayBuffer()),
      fetch(`${origin}/fonts/noto-sans-jp-600.woff`).then((r) => r.arrayBuffer()),
    ])
  }
  return fontsPromise
}

export async function generateOgImage(title: string, origin: string): Promise<Uint8Array> {
  const [, fonts] = await Promise.all([ensureInit(), ensureFonts(origin)])
  const [interRegular, interSemiBold, notoRegular, notoSemiBold] = fonts

  const fontSize = title.length > 40 ? 40 : title.length > 24 ? 52 : 64

  const svg = await satori(
    <div
      style={{
        display: 'flex',
        width: '1200px',
        height: '630px',
        backgroundImage: 'linear-gradient(135deg, #808080 0%, #000000 100%)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '56px 64px 48px 64px',
        }}
      >
        <div
          style={{
            fontSize: `${fontSize}px`,
            color: '#111111',
            fontWeight: 600,
            lineHeight: 1.4,
            fontFamily: 'Inter, Noto Sans JP',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            fontSize: '22px',
            color: '#888888',
            fontWeight: 400,
            fontFamily: 'Inter',
            letterSpacing: '0.03em',
          }}
        >
          kazui.dev
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: interSemiBold, weight: 600, style: 'normal' },
        { name: 'Noto Sans JP', data: notoRegular, weight: 400, style: 'normal' },
        { name: 'Noto Sans JP', data: notoSemiBold, weight: 600, style: 'normal' },
      ],
    },
  )

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  return resvg.render().asPng()
}
