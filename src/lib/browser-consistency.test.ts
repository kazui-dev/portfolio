import { describe, expect, it } from 'vitest'
import { formatDate } from './format-date'
import { getScrollRestorationKey } from './scroll-restoration'

describe('server and browser consistency', () => {
  it('formats publication dates in Japan even when the server uses UTC', () => {
    expect(formatDate(new Date('2026-06-24T16:00:00Z'))).toBe('2026.6.25')
    expect(formatDate(new Date('2026-12-31T15:00:00Z'))).toBe('2027.1.1')
  })

  it('uses serialized search parameters rather than coercing the parsed object', () => {
    const location = {
      pathname: '/notes',
      searchStr: '?tag=React',
      search: Object.create(null),
    }
    expect(getScrollRestorationKey(location)).toBe('/notes?tag=React')
    expect(getScrollRestorationKey({ pathname: '/notes', searchStr: '' })).toBe('/notes')
  })
})
