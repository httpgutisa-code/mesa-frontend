import api from './apiClient'

export async function checkout({ items, observaciones, codigo_promocion }) {
  const payload = { items, observaciones }
  if (codigo_promocion) payload.codigo_promocion = codigo_promocion
  const { data } = await api.post('/compra/compras/checkout/', payload)
  return data
}

export async function payOrder(id, referencia) {
  const { data } = await api.post(`/compra/compras/${id}/pay/`, { referencia })
  return data
}

export async function createStripeSession(id, payload = {}) {
  // payload may include success_url and cancel_url, backend defaults to FRONTEND_URL if omitted
  const { data } = await api.post(`/compra/compras/${id}/stripe_session/`, payload)
  return data
}

export async function downloadReceipt(id) {
  // Returns a Blob (PDF) for the receipt
  const res = await api.get(`/compra/compras/${id}/receipt/`, { responseType: 'blob' })
  return res.data
}

export async function getOrders(params = {}) {
  const { data } = await api.get('/compra/compras/', { params })
  return data
}

export async function getOrder(id) {
  const { data } = await api.get(`/compra/compras/${id}/`)
  return data
}
