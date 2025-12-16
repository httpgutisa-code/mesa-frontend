import api from './apiClient'

export async function getPromociones(vigentes = true) {
  const params = vigentes ? { vigentes: 'true' } : {}
  const { data } = await api.get('/promociones/promociones/', { params })
  return data
}

export async function validarPromocion(codigo, monto) {
  // Según OpenAPI, validar es POST /promociones/promociones/validar/ con body { codigo, monto }
  const payload = { codigo: codigo.toUpperCase(), monto }
  const { data } = await api.post('/promociones/promociones/validar/', payload)
  return data
}
