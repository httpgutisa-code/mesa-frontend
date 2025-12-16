import apiClient from './apiClient'

/**
 * Obtener devoluciones del cliente actual
 * @param {string|null} estado - Filtrar por estado: 'pendiente', 'aprobada', 'rechazada', 'completada'
 * @param {string|null} tipo - Filtrar por tipo: 'devolucion', 'cambio'
 */
export const getMisDevoluciones = async (estado = null, tipo = null) => {
  const params = {}
  if (estado) params.estado = estado
  if (tipo) params.tipo = tipo
  
  const { data } = await apiClient.get('/promociones/devoluciones/', { params })
  return data.results || []
}

/**
 * Crear solicitud de devolución
 * @param {Object} payload
 * @param {number} payload.compra_item - ID del item de compra
 * @param {string} payload.tipo - 'devolucion' o 'cambio'
 * @param {string} payload.motivo - Motivo de la devolución
 * @param {string} payload.descripcion - Descripción detallada (opcional)
 * @param {number} payload.cantidad - Cantidad a devolver
 */
export const crearDevolucion = async (payload) => {
  const { data } = await apiClient.post('/promociones/devoluciones/', payload)
  return data
}

/**
 * Cancelar solicitud de devolución (solo si estado = 'pendiente')
 * @param {number} devolucionId
 */
export const cancelarDevolucion = async (devolucionId) => {
  const { data } = await apiClient.post(`/promociones/devoluciones/${devolucionId}/cancelar/`)
  return data
}

/**
 * Obtener detalle de una devolución
 * @param {number} devolucionId
 */
export const getDevolucion = async (devolucionId) => {
  const { data } = await apiClient.get(`/promociones/devoluciones/${devolucionId}/`)
  return data
}

/**
 * Verificar si un producto está dentro de garantía (30 días)
 * @param {string} fechaCompra - Fecha de compra en formato ISO
 * @returns {Object} { dentroGarantia, diasRestantes, diasTranscurridos }
 */
export const verificarGarantia = (fechaCompra) => {
  const fecha = new Date(fechaCompra)
  const hoy = new Date()
  const diasTranscurridos = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24))
  const diasRestantes = Math.max(0, 30 - diasTranscurridos)
  
  return {
    dentroGarantia: diasTranscurridos <= 30,
    diasRestantes,
    diasTranscurridos
  }
}
