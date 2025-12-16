import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProductById } from '../services/products'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import { ROUTES } from '../constants/routes'
import Breadcrumbs from '../components/common/Breadcrumbs'
import Button from '../components/ui/Button'
import { ShoppingCart, Package, Tag, CheckCircle } from 'lucide-react'
import toast from '../utils/toastBus'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const { addItem } = useCart()

  // Haptic feedback for PWA (vibración táctil)
  const hapticFeedback = (type = 'light') => {
    if ('vibrate' in navigator) {
      if (type === 'light') navigator.vibrate(10)
      if (type === 'medium') navigator.vibrate(20)
      if (type === 'success') navigator.vibrate([10, 50, 10])
    }
  }

  const handleAddToCart = () => {
    setAddingToCart(true)
    hapticFeedback('light')
    
    setTimeout(() => {
      addItem(product, 1)
      setAddingToCart(false)
      hapticFeedback('success')
      toast.success('Producto añadido', {
        description: product?.nombre || product?.name,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />
      })
    }, 300)
  }

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const data = await getProductById(id)
        if (!ignore) setProduct(data)
      } catch {
        if (!ignore) setProduct(null)
      } finally { if (!ignore) setLoading(false) }
    }
    load()
    return () => { ignore = true }
  }, [id])

  if (loading) {
    return (
      <div className="container-responsive py-10 page-anim">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-square rounded-2xl skeleton-shimmer" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 rounded skeleton-shimmer" />
            <div className="h-6 w-1/2 rounded skeleton-shimmer" />
            <div className="h-24 w-full rounded skeleton-shimmer" />
            <div className="h-10 w-40 rounded skeleton-shimmer" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container-responsive py-10 page-anim">
        <div className="card-surface p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-semibold">Producto no encontrado</h2>
          <p className="text-gray-600 dark:text-gray-400">El producto que buscas no existe o fue eliminado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-responsive py-4 sm:py-8 page-anim pb-32 lg:pb-8">
      {/* Breadcrumbs mejorado */}
      <div className="mb-6 sm:mb-8">
        <Breadcrumbs
          items={[
            { label: 'Inicio', to: ROUTES.home },
            { label: 'Tienda', to: ROUTES.catalog },
            { label: product?.nombre || product?.name },
          ]}
        />
      </div>

      {/* Layout premium mejorado */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-2">
        {/* Imagen del producto premium */}
        <div>
          <div className="overflow-hidden rounded-3xl card-surface grid place-items-center aspect-square shadow-[0_12px_40px_rgba(0,128,255,0.15)] border-2 border-[hsl(var(--primary))]/10 transition-all hover:shadow-[0_20px_60px_rgba(0,128,255,0.25)] hover:scale-[1.01] active:scale-100 relative group">
            {/* Badge de disponibilidad flotante */}
            {product?.stock > 0 && (
              <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--success))]/80 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-white/20 flex items-center gap-2 font-bold text-sm">
                <CheckCircle className="h-4 w-4" />
                Disponible ahora
              </div>
            )}
            {product?.imagen || product?.image ? (
              <img
                src={product.imagen || product.image}
                alt={product?.nombre || product?.name || 'Producto'}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-gray-400">
                <Package className="h-20 w-20 sm:h-24 sm:w-24" strokeWidth={1.5} />
                <span className="text-sm font-medium">Sin imagen disponible</span>
              </div>
            )}
            {/* Gradiente decorativo en hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>

        {/* Info del producto premium */}
        <div className="space-y-6 sm:space-y-7">
          {/* Header con precio destacado premium */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">{product?.nombre || product?.name}</h1>
            <div className="flex items-baseline gap-3 flex-wrap">
              <p className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
                {formatPrice(Number(product?.precio ?? product?.price ?? 0))}
              </p>
              {product?.stock > 0 && (
                <span className="inline-flex items-center gap-2 text-base text-[hsl(var(--success))] font-bold px-3 py-1.5 rounded-full bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/20">
                  <CheckCircle className="h-5 w-5" />
                  En stock
                </span>
              )}
            </div>
          </div>
          
          {/* Descripción premium */}
          {(product?.descripcion || product?.description) && (
            <div className="rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))]/5 to-transparent border-2 border-[hsl(var(--primary))]/10 p-5 sm:p-6 shadow-sm">
              <h2 className="text-sm font-black text-[hsl(var(--primary))] uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Descripción
              </h2>
              <p className="text-base sm:text-lg text-gray-800 dark:text-gray-300 leading-relaxed font-medium">
                {product.descripcion || product.description}
              </p>
            </div>
          )}
          
          {/* Detalles técnicos premium */}
          <div className="rounded-2xl bg-gradient-to-br from-surface-hover to-transparent border-2 border-[rgb(var(--border-rgb))]/20 p-6 shadow-sm">
            <h2 className="text-sm font-black text-[hsl(var(--primary))] uppercase tracking-wider mb-4">Especificaciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product?.sku && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-[hsl(var(--accent))] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                  <div>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-500 block uppercase tracking-wider">SKU</span>
                    <p className="font-bold text-base mt-1 text-gray-900 dark:text-gray-100">{product.sku}</p>
                  </div>
                </div>
              )}
              {product?.categoria?.nombre && (
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-[hsl(var(--accent))] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <div>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-500 block uppercase tracking-wider">Categoría</span>
                    <p className="font-bold text-base mt-1 text-gray-900 dark:text-gray-100">{product.categoria.nombre}</p>
                  </div>
                </div>
              )}
              {typeof product?.stock === 'number' && (
                <div className="flex items-start gap-3 col-span-full">
                  <Package className="h-5 w-5 text-[hsl(var(--accent))] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                  <div>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-500 block uppercase tracking-wider">Stock disponible</span>
                    <p className="font-bold text-base mt-1">
                      <span className={product.stock > 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--error))]]'}>
                        {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Producto agotado'}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Botón de escritorio premium */}
          <div className="hidden lg:flex items-center gap-4 pt-4">
            <Button 
              onClick={handleAddToCart}
              disabled={product?.stock === 0 || addingToCart}
              className="flex-1 text-lg py-5 px-10 shadow-[0_12px_32px_rgba(0,128,255,0.35)] hover:shadow-[0_16px_40px_rgba(0,128,255,0.45)]"
            >
              {addingToCart ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Añadiendo al carrito...
                </span>
              ) : product?.stock === 0 ? (
                'Producto agotado'
              ) : (
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  Añadir al carrito
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky action bar PREMIUM para móvil - Glassmorphism mejorado */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[40] backdrop-blur-2xl bg-[rgb(var(--bg))]/95 border-t-2 border-[hsl(var(--primary))]/20 shadow-[0_-8px_32px_rgba(0,128,255,0.15)] pwa-safe-bottom">
        <div className="container-responsive py-4">
          <div className="flex items-center gap-4">
            {/* Info compacta premium */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs text-gray-700 dark:text-gray-400 truncate font-semibold uppercase tracking-wider">
                {product?.nombre || product?.name}
              </span>
              <span className="text-2xl font-black bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
                {formatPrice(Number(product?.precio ?? product?.price ?? 0))}
              </span>
            </div>
            
            {/* Botón principal premium con gradiente */}
            <Button 
              onClick={handleAddToCart}
              disabled={product?.stock === 0 || addingToCart}
              className="flex-shrink-0 shadow-[0_8px_24px_rgba(0,128,255,0.4)] hover:shadow-[0_12px_32px_rgba(0,128,255,0.5)] px-6 py-4 text-base"
            >
              {addingToCart ? (
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : product?.stock === 0 ? (
                'Agotado'
              ) : (
                <span className="flex items-center gap-2 font-black">
                  <ShoppingCart className="h-5 w-5" />
                  Añadir
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
