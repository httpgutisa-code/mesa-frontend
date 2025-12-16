const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function resolveImageUrl(pathOrUrl, fallback = 'https://placehold.co/600x600?text=Producto') {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return fallback
  const src = pathOrUrl.trim()
  // Absoluta
  if (/^https?:\/\//i.test(src)) return src
  // Ruta absoluta en el mismo host
  if (src.startsWith('/')) return `${API_URL}${src}`
  // Ruta relativa de media (común: 'productos/archivo.avif')
  return `${API_URL}/media/${src}`
}


