import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getOrders } from '../services/orders'
import { getMisDevoluciones, cancelarDevolucion } from '../services/devoluciones'
import { toArray } from '../utils/data'
import { formatPrice } from '../utils/format'
import Pagination from '../components/common/Pagination'
import StatusChip from '../components/common/StatusChip'
import GarantiaInfo from '../components/common/GarantiaInfo'
import ModalDevolucion from '../components/common/ModalDevolucion'
import toast from '../utils/toastBus'
import { ROUTES } from '../constants/routes'
import { Package, RotateCcw, Clock, CheckCircle2, XCircle } from 'lucide-react'
import PageTitle from '../components/common/PageTitle'

export default function Orders() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [devoluciones, setDevoluciones] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalItem, setModalItem] = useState(null)
  const [tab, setTab] = useState('compras') // 'compras' o 'devoluciones'
  const page = Number(searchParams.get('page') || '1')
  const ordering = searchParams.get('ordering') || '-fecha'

  useEffect(() => {
    let ignore = false
    ;(async () => {
      setLoading(true)
      try {
        const [ordersData, devolucionesData] = await Promise.all([
          getOrders({ page, ordering }),
          getMisDevoluciones()
        ])
        if (!ignore) {
          setOrders(toArray(ordersData))
          setDevoluciones(devolucionesData || [])
          const count = ordersData?.count
          setTotalPages(count ? Math.max(1, Math.ceil(count / 20)) : 1)
        }
      } catch {
        if (!ignore) {
          setOrders([])
          setDevoluciones([])
        }
      } finally { if (!ignore) setLoading(false) }
    })()
    return () => { ignore = true }
  }, [page, ordering])

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next, { replace: true })
  }

  const handleDevolucionCreada = async () => {
    // Recargar devoluciones
    try {
      const devolucionesData = await getMisDevoluciones()
      setDevoluciones(devolucionesData || [])
    } catch (e) {
      console.error('Error al recargar devoluciones:', e)
    }
  }

  const getEstadoBadge = (estado) => {
    const configs = {
      pendiente: { 
        icon: Clock, 
        className: 'bg-amber-500/20 text-amber-700 border-amber-500/30 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700/50',
        label: 'Pendiente'
      },
      aprobada: { 
        icon: CheckCircle2, 
        className: 'bg-blue-500/20 text-blue-700 border-blue-500/30 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700/50',
        label: 'Aprobada'
      },
      rechazada: { 
        icon: XCircle, 
        className: 'bg-red-500/20 text-red-700 border-red-500/30 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700/50',
        label: 'Rechazada'
      },
      completada: { 
        icon: CheckCircle2, 
        className: 'badge-success',
        label: 'Completada'
      }
    }
    
    const config = configs[estado] || configs.pendiente
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    )
  }

  return (
    <div className="container-responsive py-6 sm:py-10">
      <PageTitle
        icon={<Package className="h-7 w-7" />}
        eyebrow="Pedidos"
        title="Mis compras"
        subtitle="Historial completo de pedidos, estado de pago y solicitudes de devolución."
      />

      {/* Tabs premium */}
      <div className="mb-8 flex gap-2 border-b-2 border-[hsl(var(--primary))]/10">
        <button
          onClick={() => setTab('compras')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-3 -mb-[2px] rounded-t-lg ${
            tab === 'compras'
              ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-surface-hover'
          }`}
        >
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Compras ({orders.length})
          </span>
        </button>
        <button
          onClick={() => setTab('devoluciones')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-3 -mb-[2px] rounded-t-lg ${
            tab === 'devoluciones'
              ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-surface-hover'
          }`}
        >
          <span className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Devoluciones ({devoluciones.length})
          </span>
        </button>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-xl bg-surface-hover" />
      ) : tab === 'compras' ? (
        orders.length === 0 ? (
          <div className="card-surface p-12 sm:p-16 text-center border-2 border-dashed border-[hsl(var(--primary))]/20 rounded-3xl">
            <div className="mx-auto mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 text-[hsl(var(--primary))]" />
            </div>
            <h2 className="mb-3 text-2xl sm:text-3xl font-black">Aún no tienes compras</h2>
            <p className="mb-8 text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium max-w-md mx-auto">
              Comienza a explorar nuestros productos increíbles
            </p>
            <div className="mt-6">
              <Link to={ROUTES.catalog} className="btn-primary inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-bold shadow-[0_8px_24px_rgba(0,128,255,0.35)]">Ir a la tienda</Link>
            </div>
          </div>
        ) : (
          <>
            {/* Cards para móvil */}
            <div className="space-y-3 sm:hidden">
              {orders.map((o) => {
                const orderNumber = `SS-${String(o.id).padStart(5, '0')}`
                const orderDate = o.fecha ? new Date(o.fecha) : null
                const dateStr = orderDate 
                  ? orderDate.toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })
                  : '—'
                const timeStr = orderDate 
                  ? orderDate.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })
                  : ''
                
                return (
                  <Link
                    key={o.id}
                    to={ROUTES.orderDetail.replace(':id', String(o.id))}
                    className="block card-surface rounded-xl p-4 hover:bg-surface-hover active:scale-[0.99] transition"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-base">{orderNumber}</div>
                          <div className="text-xs text-gray-500">
                            {o.items?.length || 0} {o.items?.length === 1 ? 'producto' : 'productos'}
                          </div>
                        </div>
                      </div>
                      <StatusChip status={o.pagado_en ? 'paid' : 'pending'} />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <div className="text-gray-500 text-xs">Fecha</div>
                        <div className="font-medium">{dateStr}</div>
                        {timeStr && <div className="text-xs text-gray-500">{timeStr}</div>}
                      </div>
                      <div className="text-right">
                        <div className="text-gray-500 text-xs">Total</div>
                        <div className="text-lg font-bold text-[hsl(var(--primary))]">{formatPrice(Number(o.total ?? 0))}</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Tabla para desktop */}
            <div className="hidden sm:block space-y-3">
              <div className="overflow-x-auto rounded-xl border border-subtle">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="bg-surface-hover text-left">
                    <tr>
                      <th className="p-3">Pedido</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const orderNumber = `SS-${String(o.id).padStart(5, '0')}`
                      const orderDate = o.fecha ? new Date(o.fecha) : null
                      const dateStr = orderDate 
                        ? orderDate.toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })
                        : '—'
                      const timeStr = orderDate 
                        ? orderDate.toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                        : ''
                      
                      return (
                        <tr key={o.id} className="border-t border-subtle hover:bg-surface-hover transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                                <Package className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">{orderNumber}</div>
                                <div className="text-xs text-gray-500">{o.items?.length || 0} {o.items?.length === 1 ? 'producto' : 'productos'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="font-medium">{dateStr}</span>
                              {timeStr && <span className="text-xs text-gray-500">{timeStr}</span>}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-[hsl(var(--primary))]">{formatPrice(Number(o.total ?? 0))}</span>
                          </td>
                          <td className="p-3">
                            <StatusChip status={o.pagado_en ? 'paid' : 'pending'} />
                          </td>
                          <td className="p-3 text-right">
                            <Link 
                              className="text-[hsl(var(--primary))] hover:underline font-medium text-sm" 
                              to={ROUTES.orderDetail.replace(':id', String(o.id))}
                            >
                              Ver detalle →
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <Pagination page={page} total={totalPages} onPageChange={setPage} />
          </>
        )
      ) : (
        // Tab de Devoluciones
        devoluciones.length === 0 ? (
          <div className="card-surface p-6 text-center text-[rgb(var(--fg))]/70">
            No tienes solicitudes de devolución.
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {devoluciones.map((dev) => (
              <div key={dev.id} className="card-surface rounded-xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base">Devolución #{dev.id}</h3>
                      {getEstadoBadge(dev.estado)}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {dev.tipo === 'devolucion' ? 'Devolución con reembolso' : 'Cambio por otro producto'}
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-sm">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Solicitado</div>
                    <div className="font-medium">
                      {new Date(dev.fecha_solicitud).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-subtle pt-4 space-y-3">
                  <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                    <div className="text-sm">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Producto</div>
                      <p className="font-medium line-clamp-2">{dev.compra_item_info?.producto_nombre || '—'}</p>
                    </div>
                    <div className="text-sm">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cantidad</div>
                      <p className="font-medium">{dev.cantidad}</p>
                    </div>
                    <div className="text-sm">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Motivo</div>
                      <p className="font-medium">{dev.motivo}</p>
                    </div>
                    {dev.tipo === 'devolucion' && dev.monto_reembolso && (
                      <div className="text-sm">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Monto</div>
                        <p className="text-base font-bold text-green-600 dark:text-green-400">
                          {formatPrice(parseFloat(dev.monto_reembolso))}
                        </p>
                      </div>
                    )}
                  </div>

                  {dev.descripcion && (
                    <div className="text-sm pt-2 border-t border-subtle">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Descripción</div>
                      <p className="text-gray-700 dark:text-gray-300">{dev.descripcion}</p>
                    </div>
                  )}

                  {dev.respuesta_admin && (
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-sm">
                      <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1 text-xs uppercase tracking-wide">
                        Respuesta del administrador
                      </div>
                      <p className="text-blue-700 dark:text-blue-300">{dev.respuesta_admin}</p>
                    </div>
                  )}

                  {dev.puede_cancelar && (
                    <div className="pt-2">
                      <button
                        onClick={async () => {
                          if (confirm('¿Estás seguro de cancelar esta solicitud?')) {
                            try {
                              await cancelarDevolucion(dev.id)
                              toast.success('Solicitud cancelada')
                              handleDevolucionCreada()
                            } catch (e) {
                              toast.error('Error al cancelar la solicitud')
                            }
                          }
                        }}
                        className="text-sm font-medium text-red-600 hover:underline dark:text-red-400 active:scale-95 transition inline-flex items-center gap-1"
                      >
                        <XCircle size={14} />
                        Cancelar solicitud
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal de devolución */}
      {modalItem && (
        <ModalDevolucion
          item={modalItem}
          onClose={() => setModalItem(null)}
          onSuccess={handleDevolucionCreada}
        />
      )}
    </div>
  )
}
