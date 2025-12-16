import { useState } from 'react'
import { X, RotateCcw, RefreshCw } from 'lucide-react'
import { crearDevolucion } from '../../services/devoluciones'
import { formatPrice } from '../../utils/format'
import toast from '../../utils/toastBus'
import Button from '../ui/Button'

export default function ModalDevolucion({ item, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    tipo: 'devolucion',
    motivo: '',
    descripcion: '',
    cantidad: 1
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.motivo.trim()) {
      toast.error('Debes especificar un motivo')
      return
    }

    if (formData.cantidad < 1 || formData.cantidad > item.cantidad) {
      toast.error(`La cantidad debe estar entre 1 y ${item.cantidad}`)
      return
    }

    setLoading(true)
    
    try {
      const resultado = await crearDevolucion({
        compra_item: item.id,
        tipo: formData.tipo,
        motivo: formData.motivo,
        descripcion: formData.descripcion,
        cantidad: formData.cantidad
      })
      
      toast.success('Solicitud de devolución creada exitosamente')
      onSuccess(resultado)
      onClose()
    } catch (error) {
      const mensaje = error?.response?.data?.detail || 'Error al crear la solicitud'
      toast.error(mensaje)
    } finally {
      setLoading(false)
    }
  }

  const montoReembolso = (parseFloat(item.precio_unitario || 0) * formData.cantidad).toFixed(2)

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md md:max-w-lg max-h-[85vh] overflow-hidden rounded-2xl border border-subtle bg-[rgb(var(--card))] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-subtle bg-[hsl(var(--primary-light))] px-5 py-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-[hsl(var(--primary))]">Solicitar Devolución</h2>
            <p className="mt-1 text-xs md:text-sm text-[rgb(var(--muted))]">
              Completa el formulario para iniciar tu devolución
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[rgb(var(--fg))]/80 hover:bg-white/60 hover:text-[rgb(var(--fg))] dark:hover:bg-white/5"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

  {/* Content scrollable */}
  <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Producto info */}
          <div className="mb-5 rounded-lg border border-subtle bg-surface-hover p-3">
            <div className="font-semibold">{item.producto_nombre}</div>
            <div className="mt-1 flex items-center justify-between text-sm text-[rgb(var(--muted))]">
              <span>Precio unitario: {formatPrice(parseFloat(item.precio_unitario || 0))}</span>
              <span>Cantidad comprada: {item.cantidad}</span>
            </div>
          </div>

          {/* Form */}
          <form id="devolucion-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Tipo de devolución
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo: 'devolucion' })}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition ${
                    formData.tipo === 'devolucion'
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary))]/20'
                      : 'border-subtle hover:bg-surface-hover'
                  }`}
                >
                  <RotateCcw className="h-4 w-4" />
                  Devolución con Reembolso
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo: 'cambio' })}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition ${
                    formData.tipo === 'cambio'
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary))]/20'
                      : 'border-subtle hover:bg-surface-hover'
                  }`}
                >
                  <RefreshCw className="h-4 w-4" />
                  Cambio por otro Producto
                </button>
              </div>
            </div>

            {/* Cantidad */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Cantidad a devolver
              </label>
              <input
                type="number"
                min="1"
                max={item.cantidad}
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 1 })}
                className="input w-full"
                required
              />
            </div>

            {/* Monto reembolso */}
            {formData.tipo === 'devolucion' && (
              <div className="rounded-lg p-3 callout-success">
                <div className="text-[11px] uppercase tracking-wide opacity-80">Monto a reembolsar</div>
                <div className="mt-0.5 text-xl font-extrabold text-success-strong dark:text-green-400">
                  {formatPrice(parseFloat(montoReembolso))}
                </div>
              </div>
            )}

            {/* Motivo */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Motivo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Producto defectuoso, talla incorrecta..."
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Descripción detallada
              </label>
              <textarea
                placeholder="Describe el problema o razón de la devolución en detalle..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="input w-full resize-none"
                rows={4}
              />
            </div>
          </form>
        </div>
        {/* Footer actions outside scroll area to avoid overlap */}
        <div className="border-t border-subtle bg-[rgb(var(--card))] px-5 py-4 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="devolucion-form"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </div>
      </div>
    </div>
  )
}
