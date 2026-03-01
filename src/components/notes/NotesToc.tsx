import type { TocItem } from './toc'

function handleTocClick(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault()

  const target = document.getElementById(id)
  const resolvedId = id

  window.location.hash = resolvedId

  if (target) {
    const offset = 96
    const top = target.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

export default function NotesToc({ items }: { items: TocItem[] }) {
  const linkClass = 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'

  if (items.length === 0) {
    return null
  }

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-32 rounded-lg border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-950">
        <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          目次
        </p>

        <nav aria-label="Table of contents">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className={item.level === 3 ? 'pl-1' : ''}>
                <a
                  href={`#${item.id}`}
                  onClick={(event) => handleTocClick(event, item.id)}
                  className={
                    item.level === 3
                      ? `flex items-center gap-2 text-sm rounded-md px-2 py-1 transition-colors ${linkClass}`
                      : `block text-sm font-semibold rounded-md px-2 py-1 transition-colors ${linkClass}`
                  }
                >
                  {item.level === 3 ? (
                    <span
                      className="inline-block size-1.5 rounded-full bg-slate-400/80 dark:bg-slate-500/80"
                      aria-hidden="true"
                    />
                  ) : null}
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}