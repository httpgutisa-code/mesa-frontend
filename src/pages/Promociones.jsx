import { useEffect, useState } from 'react'
import { getPromociones } from '../services/promociones'
import { toArray } from '../utils/data'
import { formatPrice } from '../utils/format'
import { Tag, Calendar, Percent, DollarSign, Gift, TrendingUp, Clock, CheckCircle2, XCircle, ShoppingCart } from 'lucide-react'
import PageTitle from '../components/common/PageTitle'

export default function Promociones() {
  const [loading, setLoading] = useState(true)
  const [promociones, setPromociones] = useState([])

  useEffect(() => {
    let ignore = false
    ;(async () => {
      setLoading(true)
      try {
        const data = await getPromociones(true)
        if (!ignore) {
          setPromociones(toArray(data))
        }
      } catch {
        if (!ignore) setPromociones([])
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => { ignore = true }
  }, [])

  const getTipoIcon = (tipo) => {
    return tipo === 'porcentaje' ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />
  }

  const formatFecha = (fecha) => {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const calcularProgreso = (usosActuales, usosMaximos) => {
    if (!usosMaximos) return 0
    return Math.min((usosActuales / usosMaximos) * 100, 100)
  }

  return (
    <div className="container-responsive py-8 page-anim">
      <PageTitle
        icon={<Gift className="h-7 w-7" />}
        eyebrow="Beneficios"
        title="Promociones activas"
        subtitle="Aprovecha descuentos especiales y códigos exclusivos antes de que se agoten."
      />

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-surface-hover" />
          ))}
        </div>
      ) : promociones.length === 0 ? (
        <div className="card-surface p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Tag className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">No hay promociones disponibles</h2>
          <p className="text-gray-800 dark:text-gray-400">Vuelve pronto para ver nuevas ofertas</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promociones.map((promo) => {
            const progreso = calcularProgreso(promo.usos_actuales || 0, promo.usos_maximos)
            const disponibles = promo.usos_maximos ? promo.usos_maximos - (promo.usos_actuales || 0) : null
            
            return (
              <div key={promo.id} className="card-surface card-hover overflow-hidden relative group">
                {/* Badge de estado */}
                <div className="absolute top-3 right-3 z-10">
                  {promo.esta_vigente ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm border badge-success">
                      <CheckCircle2 className="h-3 w-3" />
                      Vigente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm border badge-error">
                      <XCircle className="h-3 w-3" />
                      Expirada
                    </span>
                  )}
                </div>

                {/* Header con gradiente */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))]/10 via-[hsl(var(--primary))]/5 to-transparent p-6 pb-8">
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[hsl(var(--primary))]/10 blur-2xl" />
                  
                  <div className="relative">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))]/20 px-3 py-1.5 text-xs font-bold text-[hsl(var(--primary))]">
                      {getTipoIcon(promo.tipo_descuento)}
                      <span>
                        {promo.tipo_descuento === 'porcentaje' 
                          ? `${promo.valor_descuento}% OFF` 
                          : `$${promo.valor_descuento} OFF`}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-1">{promo.nombre}</h3>
                    
                    {promo.descripcion && (
                      <p className="text-sm text-gray-900 dark:text-white/90 line-clamp-2">
                        {promo.descripcion}
                      </p>
                    )}
                  </div>
                </div>

                {/* Código de promoción destacado */}
                <div className="px-6 -mt-4 mb-4">
                  <div className="flex items-center justify-between rounded-lg border-2 border-dashed border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[hsl(var(--primary))]" />
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-400">Código:</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(promo.codigo)
                        // Podrías agregar un toast aquí
                      }}
                      className="font-mono text-lg font-bold text-[hsl(var(--primary))] hover:scale-105 transition-transform"
                    >
                      {promo.codigo}
                    </button>
                  </div>
                </div>

                {/* Detalles compactos */}
                <div className="px-6 pb-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Vigencia - pill compacta */}
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-hover px-2 py-1 text-[11px] text-gray-900 dark:text-gray-300">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="font-medium">{formatFecha(promo.fecha_inicio)}</span>
                      <span>→</span>
                      <span className="font-medium">{formatFecha(promo.fecha_fin)}</span>
                    </span>

                    {/* Mínimo - pill brillante pero sutil */}
                    {promo.monto_minimo && parseFloat(promo.monto_minimo) > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 text-[11px] font-semibold dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700/50">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Mín {formatPrice(parseFloat(promo.monto_minimo))}
                      </span>
                    )}

                    {/* Tope - pill neutra */}
                    {promo.descuento_maximo && parseFloat(promo.descuento_maximo) > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-hover px-2 py-1 text-[11px] text-gray-900 dark:text-gray-300">
                        <DollarSign className="h-3.5 w-3.5" />
                        Tope {formatPrice(parseFloat(promo.descuento_maximo))}
                      </span>
                    )}
                  </div>
                </div>

                  {/* Disponibilidad */}
                  {promo.usos_maximos && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1.5 text-gray-800 dark:text-gray-400">
                          <Clock className="h-3.5 w-3.5" />
                          Disponibilidad
                        </span>
                        <span className="font-semibold text-[hsl(var(--primary))]">
                          {disponibles} de {promo.usos_maximos}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-700))] transition-all duration-500"
                          style={{ width: `${100 - progreso}%` }}
                        />
                      </div>
                    </div>
                  )}

                {/* Footer con CTA */}
                <div className="border-t border-subtle px-6 py-4 bg-surface-hover/50">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(promo.codigo)
                      window.location.href = '/shop'
                    }}
                    className="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02]"
                  >
                    Copiar código y comprar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info section */}
      {!loading && promociones.length > 0 && (
        <div className="mt-12 rounded-xl border border-[hsl(var(--primary))]/20 bg-gradient-to-br from-[hsl(var(--primary))]/5 to-transparent p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
              <Gift className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">¿Cómo usar los códigos de promoción?</h3>
              <ol className="space-y-1.5 text-sm text-gray-800 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs font-bold">1</span>
                  <span>Copia el código de la promoción que deseas usar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs font-bold">2</span>
                  <span>Agrega productos al carrito y ve al checkout</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs font-bold">3</span>
                  <span>Pega el código en el campo de promoción antes de confirmar tu compra</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
