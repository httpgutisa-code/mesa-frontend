import api from './apiClient'

export async function getCategories(params = {}) {
  const { data } = await api.get('/productos/categorias/', { params })
  return data
}

export async function getProducts(params = {}) {
  // Soporta: page, search, ordering, categoria
  const { data } = await api.get('/productos/', { params })
  return data
}

export async function getProductById(id) {
  const { data } = await api.get(`/productos/${id}/`)
  return data
}
