export function formatDate(date: Date) {
  return date.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' }).replace(/\//g, '.')
}
