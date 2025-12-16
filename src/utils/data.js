export function toArray(input) {
  if (Array.isArray(input)) return input
  if (Array.isArray(input?.results)) return input.results
  if (Array.isArray(input?.items)) return input.items
  if (Array.isArray(input?.data)) return input.data
  if (input && typeof input === 'object') {
    // Sometimes APIs return an object keyed by ids
    const values = Object.values(input)
    if (values.length && values.every((v) => typeof v === 'object')) return values
  }
  return []
}
