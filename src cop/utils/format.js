export function formatPrice(value = 0, currency = 'USD', locale = 'es-ES') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
  } catch {
    return `$${Number(value).toFixed(2)}`
  }
}
