import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import { checkout as checkoutOrder, payOrder, createStripeSession } from '../services/orders'
import { validarPromocion } from '../services/promociones'
import { ROUTES } from '../constants/routes'
import toast from '../utils/toastBus'
import Button from '../components/ui/Button'
import Textarea from '../components/common/Textarea'
import { ShoppingBag, CreditCard, Check, Tag, X, Sparkles } from 'lucide-react'
import PageTitle from '../components/common/PageTitle'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clear } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)
  const [paying, setPaying] = useState(false)
  const [referencia, setReferencia] = useState('')
  const [payError, setPayError] = useState('')
  const [observaciones, setObservaciones] = useState('')
  
  // Estados para promoción
  const [codigoPromocion, setCodigoPromocion] = useState('')
  const [promocionAplicada, setPromocionAplicada] = useState(null)
  const [validandoPromo, setValidandoPromo] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [totalFinal, setTotalFinal] = useState(subtotal)

  useEffect(() => {
    setTotalFinal(subtotal)
  }, [subtotal])

  const handleValidarPromocion = async () => {
    if (!codigoPromocion.trim()) {
      setPromoError('Ingrese un código de promoción')
      return
    }

    setValidandoPromo(true)
    setPromoError('')
    
    try {
      const result = await validarPromocion(codigoPromocion, subtotal)
      
      // Debug: Ver qué responde el backend
      console.log('📊 Respuesta validación promoción:', result)
      console.log('💰 Subtotal enviado:', subtotal)
      
      // Verificar que el descuento sea mayor a 0
      const descuento = parseFloat(result.descuento || 0)
      
      if (descuento <= 0) {
        // Si el descuento es 0, verificar si es por monto mínimo
        const montoMinimo = result.promocion?.monto_minimo
        if (montoMinimo && subtotal < parseFloat(montoMinimo)) {
          const msg = `Esta promoción requiere una compra mínima de ${formatPrice(parseFloat(montoMinimo))}`
          setPromoError(msg)
          toast.error(msg)
          setPromocionAplicada(null)
          setTotalFinal(subtotal)
          return
        } else {
          const msg = 'Esta promoción no aplica para tu compra actual'
          setPromoError(msg)
          toast.error(msg)
          setPromocionAplicada(null)
          setTotalFinal(subtotal)
          return
        }
      }
      
      setPromocionAplicada(result)
      setTotalFinal(parseFloat(result.total_final))
      setPromoError('')
      toast.success(`¡Promoción aplicada! Ahorro de ${formatPrice(descuento)}`)
    } catch (e) {
      const errorData = e?.response?.data
      let msg = 'Código inválido o expirado'
      
      // Intentar extraer el mensaje de error específico
      if (errorData) {
        if (errorData.detail) {
          msg = errorData.detail
        } else if (errorData.error) {
          msg = errorData.error
        } else if (errorData.message) {
          msg = errorData.message
        }
      }
      
      setPromoError(msg)
      setPromocionAplicada(null)
      setTotalFinal(subtotal)
      toast.error(msg)
    } finally {
      setValidandoPromo(false)
    }
  }

  const handleQuitarPromocion = () => {
    setPromocionAplicada(null)
    setCodigoPromocion('')
    setTotalFinal(subtotal)
    setPromoError('')
    toast.success('Promoción removida')
  }

  async function handleCheckout() {
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        items: items.map((i) => ({ producto: i.id, cantidad: i.qty })),
        observaciones,
        codigo_promocion: promocionAplicada ? codigoPromocion : undefined
      }
      const created = await checkoutOrder(payload)
      setOrder(created)
      clear()
      toast.success('Pedido creado con éxito')
    } catch (e) {
      const detail = e?.response?.data?.detail
      const msg = detail || 'No se pudo crear la compra. Intenta de nuevo.'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-responsive py-6 sm:py-10 page-anim">
      <PageTitle
        icon={<ShoppingBag className="h-7 w-7" />}
        eyebrow="Checkout"
        title="Finalizar compra"
        subtitle="Revisa tu pedido, aplica promociones y completa el pago con total seguridad."
      />
      {order ? (
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="mb-3 text-center text-xl font-semibold">¡Pedido creado exitosamente!</h2>
          <div className="mb-6 space-y-2 text-center">
            <div className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))]/10 px-4 py-2">
              <ShoppingBag className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="text-lg font-bold text-[hsl(var(--primary))]">SS-{String(order.id).padStart(5, '0')}</span>
            </div>
            <p className="text-2xl font-bold text-[hsl(var(--primary))]">{formatPrice(Number(order.total ?? 0))}</p>
            <p className="text-sm text-gray-800 dark:text-gray-600">{order.items?.length || 0} {order.items?.length === 1 ? 'producto' : 'productos'}</p>
          </div>
          
          {order.pagado_en ? (
            <div className="rounded-xl p-4 text-center callout-success">
              <p className="font-medium text-success-strong">✓ Pago confirmado</p>
              <p className="text-sm text-gray-900 dark:text-gray-400">{new Date(order.pagado_en).toLocaleString()}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stripe Payment Option */}
              <div className="rounded-xl border-2 border-[hsl(var(--primary))]/20 bg-gradient-to-br from-[hsl(var(--primary))]/5 to-transparent p-5">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-[hsl(var(--primary))] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold">Pagar con Stripe</h3>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mb-3">Método recomendado. Serás redirigido a una pasarela segura y volverás automáticamente al detalle de tu compra.</p>
                    <Button
                      onClick={async () => {
                        try {
                          const origin = window.location.origin
                          const back = `${origin}${ROUTES.orderDetail.replace(':id', String(order.id))}`
                          const session = await createStripeSession(order.id, { success_url: back, cancel_url: back })
                          if (session?.url) {
                            window.location.href = session.url
                          } else {
                            toast.error('No se pudo iniciar el pago con Stripe')
                          }
                        } catch (e) {
                          const msg = e?.response?.data?.detail || 'Error al iniciar sesión de pago'
                          toast.error(msg)
                        }
                      }}
                      className="w-full sm:w-auto"
                    >
                      Continuar al pago
                    </Button>
                  </div>
                </div>
              </div>

              {/* Manual Payment Option */}
              <div className="rounded-xl border border-subtle bg-surface-hover p-5">
                <h3 className="mb-2 font-semibold text-sm">Pago manual (alternativo)</h3>
                <p className="text-xs text-gray-800 dark:text-gray-400 mb-3">Si ya realizaste el pago por otro medio, ingresa la referencia aquí</p>
                <input
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Referencia de transacción"
                  className="input w-full mb-2"
                />
                {payError && <p className="mb-2 text-sm text-red-600">{payError}</p>}
                <Button
                  variant="outline"
                  onClick={async () => {
                    setPayError('')
                    setPaying(true)
                    try {
                      const updated = await payOrder(order.id, referencia)
                      setOrder(updated)
                      toast.success('Pago confirmado')
                    } catch (e) {
                      const detail = e?.response?.data?.detail
                      const msg = detail || 'No se pudo registrar el pago.'
                      setPayError(msg)
                      toast.error(msg)
                    } finally {
                      setPaying(false)
                    }
                  }}
                  disabled={!referencia || paying}
                  className="w-full sm:w-auto"
                >
                  {paying ? 'Confirmando…' : 'Confirmar pago'}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link to={ROUTES.orderDetail.replace(':id', String(order.id))} className="btn-outline inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium">
              Ver detalle
            </Link>
            <Link to={ROUTES.orders} className="btn-outline inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium">
              Mis compras
            </Link>
            <Link to={ROUTES.catalog} className="btn-primary inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium">
              Seguir comprando
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="mb-4 text-lg font-semibold">Resumen de compra</h2>
                
                {items.length === 0 ? (
                  <div className="card-surface p-8 text-center">
                    <p className="text-gray-800 dark:text-gray-600">No hay productos en tu carrito</p>
                    <Link to={ROUTES.catalog} className="mt-4 inline-block btn-primary rounded-md px-4 py-2 text-sm font-medium">
                      Ir a la tienda
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {items.map((x) => (
                        <div key={x.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-surface-hover border border-subtle">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{x.name}</p>
                            <p className="text-xs text-gray-800 dark:text-gray-500 mt-0.5">Cantidad: {x.qty}</p>
                          </div>
                          <span className="font-semibold text-[hsl(var(--primary))]">{formatPrice(x.price * x.qty)}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Resumen con promoción */}
                    <div className="mt-6 space-y-3 py-4 border-t border-subtle">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-800 dark:text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatPrice(subtotal)}</span>
                      </div>
                      
                      {promocionAplicada && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-success-strong dark:text-green-400">
                            <Sparkles className="h-4 w-4" />
                            Descuento ({promocionAplicada.promocion.nombre})
                          </span>
                          <span className="font-semibold text-success-strong dark:text-green-400">
                            -{formatPrice(parseFloat(promocionAplicada.descuento))}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-3 border-t border-subtle">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold text-[hsl(var(--primary))]">
                          {formatPrice(totalFinal)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {items.length > 0 && (
                <>
                  {/* Código de promoción */}
                  <div className="rounded-xl border border-subtle bg-gradient-to-br from-[hsl(var(--primary))]/5 to-transparent p-5">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-[hsl(var(--primary))]" />
                        <h3 className="font-semibold">¿Tienes un código de promoción?</h3>
                      </div>
                      <div className="text-xs text-gray-800 dark:text-gray-500">
                        Total: <span className="font-bold text-[hsl(var(--primary))]">{formatPrice(subtotal)}</span>
                      </div>
                    </div>
                    
                    {!promocionAplicada ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ej: VERANO2025"
                            value={codigoPromocion}
                            onChange={(e) => setCodigoPromocion(e.target.value.toUpperCase())}
                            className="input flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleValidarPromocion()
                              }
                            }}
                          />
                          <Button
                            onClick={handleValidarPromocion}
                            disabled={validandoPromo || !codigoPromocion.trim()}
                            variant="outline"
                            className="whitespace-nowrap"
                          >
                            {validandoPromo ? 'Validando…' : 'Aplicar'}
                          </Button>
                        </div>
                        {promoError && (
                          <p className="text-sm text-red-600 dark:text-red-400">{promoError}</p>
                        )}
                        <Link 
                          to={ROUTES.promociones}
                          className="inline-flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Ver promociones disponibles
                        </Link>
                      </div>
                    ) : (
                      <div className="rounded-lg p-4 callout-success">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Sparkles className="h-4 w-4" />
                              <span className="font-semibold">
                                {promocionAplicada.promocion.nombre}
                              </span>
                            </div>
                            <p className="text-sm">
                              Código: <span className="font-mono font-bold">{codigoPromocion}</span>
                            </p>
                            <p className="text-sm mt-1">
                              Ahorro: <span className="font-bold text-lg">{formatPrice(parseFloat(promocionAplicada.descuento))}</span>
                            </p>
                            {promocionAplicada.promocion.descripcion && (
                              <p className="text-xs mt-2 opacity-90">
                                {promocionAplicada.promocion.descripcion}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={handleQuitarPromocion}
                            className="rounded-full p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            aria-label="Quitar promoción"
                          >
                            <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Textarea
                      label="Observaciones (opcional)"
                      rows={3}
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Instrucciones de entrega, horarios preferidos, etc."
                      hint="Cualquier indicación especial para tu pedido"
                    />
                  </div>
                  
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={handleCheckout} 
                      disabled={submitting || items.length === 0}
                      className="flex-1 sm:flex-none"
                    >
                      {submitting ? 'Procesando…' : 'Crear compra'}
                    </Button>
                    <Link to={ROUTES.cart} className="btn-outline inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium flex-1 sm:flex-none">
                      Volver al carrito
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Info Sidebar */}
            <div className="space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-[hsl(var(--primary))]/5 to-transparent border border-[hsl(var(--primary))]/10 p-5">
                <h3 className="mb-3 font-semibold text-sm flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs font-bold">?</span>
                  ¿Cómo funciona?
                </h3>
                <ol className="space-y-2.5 text-xs text-gray-800 dark:text-gray-400">
                  <li className="flex gap-2.5">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-bold text-[10px]">1</span>
                    <span>Crea tu compra con los productos del carrito</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-bold text-[10px]">2</span>
                    <span>Elige pagar con Stripe o registrar un pago manual</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-bold text-[10px]">3</span>
                    <span>Recibe confirmación y descarga tu comprobante</span>
                  </li>
                </ol>
              </div>
              
              <div className="rounded-lg p-4 callout-success flex items-start gap-3">
                <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Compra segura</h3>
                  <p className="text-xs">Pagos protegidos con Stripe. Tu información está segura.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
