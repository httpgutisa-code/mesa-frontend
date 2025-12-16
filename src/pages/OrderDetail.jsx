import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder, payOrder, createStripeSession, downloadReceipt } from '../services/orders'
import { formatPrice } from '../utils/format'
import { verificarGarantia } from '../services/devoluciones'
import toast from '../utils/toastBus'
import StatusChip from '../components/common/StatusChip'
import GarantiaInfo from '../components/common/GarantiaInfo'
import ModalDevolucion from '../components/common/ModalDevolucion'
import { Calendar, CreditCard, ClipboardCopy, Printer, AlertCircle, CheckCircle2, Package, Download, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import Button from '../components/ui/Button'
import PageTitle from '../components/common/PageTitle'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [referencia, setReferencia] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [itemsOpen, setItemsOpen] = useState(false)
  const [modalItem, setModalItem] = useState(null)

  const fetchOrder = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getOrder(id)
      setOrder(data)
    } catch (e) {
      setError('No se pudo cargar la compra.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const items = useMemo(() => Array.isArray(order?.items) ? order.items : [], [order])
  const computedSubtotal = useMemo(() => items.reduce((acc, it) => acc + Number(it.subtotal ?? 0), 0), [items])

  if (loading) {
    return (
      <div className="container-responsive py-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-7 w-56 animate-pulse rounded-md bg-black/10" />
          <div className="h-6 w-40 animate-pulse rounded-md bg-black/10" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-36 animate-pulse rounded-xl bg-surface-hover" />
            <div className="h-56 animate-pulse rounded-xl bg-surface-hover" />
          </div>
          <div className="h-56 animate-pulse rounded-xl bg-surface-hover" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-responsive py-8">
        <div className="rounded-xl border border-black/5 p-6 text-center text-gray-600">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
            <AlertCircle size={18} />
          </div>
          {error || 'Compra no encontrada.'}
          <div className="mt-4">
            <button onClick={fetchOrder} className="text-sm text-[hsl(var(--primary))] hover:underline">Reintentar</button>
          </div>
        </div>
      </div>
    )
  }

  // Generar número de pedido formateado
  const orderNumber = `SS-${String(order.id).padStart(5, '0')}`
  const orderDate = order.fecha ? new Date(order.fecha) : null
  const orderDateLabel = orderDate
    ? orderDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Fecha pendiente'
  const statusSubtitle = (
    <span className="flex flex-wrap items-center gap-2">
      <span>
        {items.length} {items.length === 1 ? 'producto' : 'productos'}
      </span>
      <span className="text-gray-400">•</span>
      <span>{orderDateLabel}</span>
      <span className="text-gray-400">•</span>
      <StatusChip status={order.pagado_en ? 'paid' : 'pending'} />
    </span>
  )

  return (
    <div className="container-responsive py-4 sm:py-8">
      <PageTitle
        icon={<Package className="h-7 w-7" />}
        eyebrow="Pedido"
        title={`Pedido ${orderNumber}`}
        subtitle={statusSubtitle}
        actions={(
          <>
            <Link to="/orders" className="text-sm font-semibold text-[hsl(var(--primary))] hover:underline">
              ← Volver
            </Link>
            <button 
              onClick={() => window.print()} 
              className="inline-flex items-center gap-1.5 rounded-lg border border-subtle px-3 py-2 text-xs font-medium hover:bg-surface-hover active:scale-95 transition"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </>
        )}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="card-surface rounded-xl p-4 sm:p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base sm:text-lg font-semibold">
              <Calendar size={18} className="text-[hsl(var(--primary))]" /> 
              Resumen
            </h2>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="text-sm">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Fecha</div>
                  <div className="font-medium">{order.fecha ? new Date(order.fecha).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</div>
                </div>
                <div className="text-sm">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total</div>
                  <div className="text-lg font-bold text-[hsl(var(--primary))]">{formatPrice(Number(order.total ?? 0))}</div>
                </div>
              </div>
              
              {order.observaciones && (
                <div className="text-sm pt-2 border-t border-subtle">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Observaciones</div>
                  <div className="text-gray-700 dark:text-gray-300">{order.observaciones}</div>
                </div>
              )}
              
              {order.pago_referencia && (
                <div className="text-sm pt-2 border-t border-subtle">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Referencia de pago</div>
                  <div className="font-mono text-gray-700 dark:text-gray-300">{order.pago_referencia}</div>
                </div>
              )}
            </div>
          </div>

          {/* Garantía */}
          {order.pagado_en && <GarantiaInfo compra={order} />}

          <div className="card-surface rounded-xl p-4 sm:p-5">
            <button
              onClick={() => setItemsOpen(!itemsOpen)}
              className="flex w-full items-center justify-between font-semibold hover:opacity-70 transition active:scale-[0.99]"
            >
              <span className="flex items-center gap-2 text-base sm:text-lg">
                <Package size={18} className="text-[hsl(var(--primary))]" /> 
                Items ({items.length})
              </span>
              {itemsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {itemsOpen && (
              <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible sm:pr-0">
                {items.map((it) => {
                  const puedeDevolver = order.pagado_en && verificarGarantia(order.fecha).dentroGarantia
                  
                  return (
                    <div key={it.id} className="border border-subtle rounded-lg p-3 hover:bg-surface-hover transition">
                      {/* Nombre del producto */}
                      <div className="mb-2">
                        {it.producto ? (
                          <Link 
                            to={`/product/${it.producto}`} 
                            className="font-medium hover:text-[hsl(var(--primary))] transition line-clamp-2 text-sm sm:text-base"
                          >
                            {it.producto_nombre}
                          </Link>
                        ) : (
                          <span className="font-medium line-clamp-2 text-sm sm:text-base">{it.producto_nombre}</span>
                        )}
                      </div>
                      
                      {/* Info del producto - Grid responsivo */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                        <div>
                          <span>Cantidad:</span>
                          <span className="ml-1 font-medium text-[rgb(var(--fg))]">{it.cantidad}</span>
                        </div>
                        <div className="text-right">
                          <span>Precio unit:</span>
                          <span className="ml-1 font-medium text-[rgb(var(--fg))]">{formatPrice(Number(it.precio_unitario ?? 0))}</span>
                        </div>
                      </div>
                      
                      {/* Total y botón de devolución - Compacto en una sola línea */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-subtle">
                        <div className="text-base sm:text-lg font-bold text-[hsl(var(--primary))]">
                          Total: {formatPrice(Number(it.subtotal ?? 0))}
                        </div>
                        {puedeDevolver && (
                          <button
                            onClick={() => setModalItem(it)}
                            className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/20 active:scale-95 transition whitespace-nowrap"
                            title="Solicitar devolución"
                          >
                            <RotateCcw size={12} />
                            Devolver
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
                
                {items.length === 0 && (
                  <div className="py-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Sin items.
                  </div>
                )}
                
                {/* Subtotal */}
                <div className="flex items-center justify-between border-t border-subtle pt-3 mt-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subtotal items</span>
                  <span className="text-lg font-bold text-[hsl(var(--primary))]">{formatPrice(computedSubtotal)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="card-surface rounded-xl p-4 sm:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-semibold">
            <CreditCard size={18} className="text-[hsl(var(--primary))]" /> 
            Pago
          </h2>
          {order.pagado_en ? (
            <div className="space-y-3">
              {/* Confirmación de pago */}
              <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 p-3">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 size={18} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-green-800 dark:text-green-200">Pago confirmado</div>
                    <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {new Date(order.pagado_en).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botón de descarga - Grande y visible en móvil */}
              <Button
                variant="primary"
                onClick={async () => {
                  try {
                    toast.info('Descargando comprobante...')
                    const blob = await downloadReceipt(order.id)
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `SmartSales365-Compra-${orderNumber}.pdf`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    toast.success('Comprobante descargado')
                  } catch (e) {
                    const msg = e?.response?.data?.detail || 'No se pudo descargar el comprobante'
                    toast.error(msg)
                  }
                }}
                className="w-full min-h-[48px] font-semibold"
              >
                <span className="inline-flex items-center gap-2">
                  <Download size={18} /> 
                  <span className="hidden sm:inline">Descargar comprobante</span>
                  <span className="sm:hidden">Descargar PDF</span>
                </span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Aviso de pago pendiente - sutil */}
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <AlertCircle size={16} className="text-amber-600 dark:text-amber-400" />
                <span>Pago pendiente. Completa el pago para procesar tu pedido.</span>
              </div>
              
              {/* Pagar con Stripe */}
              <div>
                <Button
                  className="w-full min-h-[48px] font-semibold"
                  onClick={async () => {
                    try {
                      const origin = window.location.origin
                      const back = `${origin}/orders/${order.id}`
                      const session = await createStripeSession(order.id, { success_url: back, cancel_url: back })
                      if (session?.url) {
                        window.location.href = session.url
                      } else {
                        toast.error('No se pudo iniciar el pago con Stripe')
                      }
                    } catch (e) {
                      const msg = e?.response?.data?.detail || 'Error al iniciar pago'
                      toast.error(msg)
                    }
                  }}
                >
                  <CreditCard size={18} className="inline mr-2" />
                  Pagar con Stripe
                </Button>
              </div>
              
              {/* Separador */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-subtle" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[rgb(var(--card))] px-2 text-gray-500">O confirma pago manual</span>
                </div>
              </div>
              
              {/* Pago manual */}
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Referencia de pago
                  </span>
                  <input
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Ej: TRANS-123456"
                    className="input w-full"
                  />
                  <span className="mt-1 block text-xs text-gray-500">
                    Ingresa tu número de transacción o referencia bancaria
                  </span>
                </label>
                <Button
                  variant="outline"
                  disabled={!referencia || paying}
                  onClick={async () => {
                    setPaying(true)
                    try {
                      const updated = await payOrder(order.id, referencia)
                      setOrder(updated)
                      toast.success('Pago confirmado')
                    } catch (e) {
                      const msg = e?.response?.data?.detail || 'No se pudo confirmar el pago'
                      toast.error(msg)
                    } finally { setPaying(false) }
                  }}
                  className="w-full min-h-[48px] font-semibold"
                >
                  {paying ? 'Confirmando…' : 'Confirmar pago manual'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de devolución */}
      {modalItem && (
        <ModalDevolucion
          item={modalItem}
          onClose={() => setModalItem(null)}
          onSuccess={() => {
            setModalItem(null)
            fetchOrder() // Recargar orden
          }}
        />
      )}
    </div>
  )
}
