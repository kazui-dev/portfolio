import type { ParsedLocation } from '@tanstack/react-router'

export function getScrollRestorationKey(location: Pick<ParsedLocation, 'pathname' | 'searchStr'>) {
  return location.pathname + location.searchStr
}
