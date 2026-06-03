import notes from './notes'

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/notes' || url.pathname.startsWith('/notes/')) {
      return notes.fetch(request)
    }
    return new Response('Not Found', { status: 404 })
  },
}
