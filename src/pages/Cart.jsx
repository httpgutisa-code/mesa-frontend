import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import Button from '../components/ui/Button'
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import { resolveImageUrl } from '../utils/image'
import PageTitle from '../components/common/PageTitle'

export default function Cart() {
  const { items, updateQty, removeItem, subtotal, clear } = useCart()

  return (
    <div className="container-responsive py-4 sm:py-8 md:py-10 page-anim">
      <PageTitle
        icon={<ShoppingCart className="h-7 w-7" />}
        eyebrow="Carrito"
        title="Carrito de compras"
        subtitle={items.length > 0 ? `${items.length} ${items.length === 1 ? 'producto' : 'productos'} listos para checkout.` : 'Todavía no agregaste productos. Explora el catálogo para comenzar.'}
        actions={items.length > 0 && (
          <button onClick={clear} className="inline-flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2.5 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800">
            <Trash2 className="h-4 w-4" />
            Vaciar carrito
          </button>
        )}
      />

      {items.length === 0 ? (
        <div className="card-surface p-12 sm:p-16 text-center border-2 border-dashed border-[hsl(var(--primary))]/20 rounded-3xl">
          <div className="mx-auto mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10">
            <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-[hsl(var(--primary))]" />
          </div>
          <h2 className="mb-3 text-2xl sm:text-3xl font-black">Tu carrito está vacío</h2>
          <p className="mb-8 text-base sm:text-lg text-gray-800 dark:text-gray-400 font-medium max-w-md mx-auto">
            Descubre nuestros productos increíbles y comienza a comprar
          </p>
          <Link to={ROUTES.catalog} className="btn-primary inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-bold shadow-[0_8px_24px_rgba(0,128,255,0.35)]">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card-surface p-4 sm:p-5 border-2 border-[rgb(var(--border-rgb))]/10 hover:border-[hsl(var(--primary))]/20 hover:shadow-[0_8px_24px_rgba(0,128,255,0.1)] transition-all">
                <div className="flex gap-4 sm:gap-5">
                  <div className="relative">
                    <img 
                      src={resolveImageUrl(item.image || item.imagen)} 
                      alt={item.name} 
                      className="h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 rounded-2xl object-cover bg-surface-hover border-2 border-[rgb(var(--border-rgb))]/20 shadow-sm" 
                    />
                    {/* Badge de cantidad */}
                    <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white text-xs font-black flex items-center justify-center shadow-lg">
                      {item.qty}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link to={`/product/${item.id}`} className="font-bold text-base sm:text-lg hover:text-[hsl(var(--primary))] line-clamp-2 transition-colors">
                      {item.name}
                    </Link>
                    <p className="mt-2 text-xl sm:text-2xl font-black bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
                      {formatPrice(item.price)}
                    </p>
                    
                    {/* Controles premium */}
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-xl border-2 border-[hsl(var(--primary))]/20 bg-gradient-to-r from-[hsl(var(--primary))]/5 to-transparent shadow-sm">
                        <button 
                          onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                          className="p-3 hover:bg-[hsl(var(--primary))]/10 transition-colors active:scale-95 rounded-l-xl font-bold"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="h-4 w-4 text-[hsl(var(--primary))]" strokeWidth={3} />
                        </button>
                        <span className="w-12 text-center font-black text-base">{item.qty}</span>
                        <button 
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="p-3 hover:bg-[hsl(var(--primary))]/10 transition-colors active:scale-95 rounded-r-xl font-bold"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-4 w-4 text-[hsl(var(--primary))]" strokeWidth={3} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)} 
                        className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-xl transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="card-surface p-6 sm:p-8 border-2 border-[hsl(var(--primary))]/10 shadow-[0_12px_40px_rgba(0,128,255,0.15)]">
              <h2 className="mb-6 text-xl sm:text-2xl font-black">Resumen del pedido</h2>
              <div className="space-y-3 pb-6 border-b-2 border-[rgb(var(--border-rgb))]/20">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-800 dark:text-gray-400 font-semibold">Productos ({items.length})</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-800 dark:text-gray-400 font-semibold">Envío</span>
                  <span className="font-bold text-[hsl(var(--success))]">GRATIS</span>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <span className="text-lg sm:text-xl font-black">Total</span>
                <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">{formatPrice(subtotal)}</span>
              </div>
              <Link 
                to={ROUTES.checkout} 
                className="btn-primary mt-8 block w-full rounded-2xl px-6 py-4 text-center text-base font-black shadow-[0_12px_32px_rgba(0,128,255,0.35)] hover:shadow-[0_16px_40px_rgba(0,128,255,0.45)]"
              >
                Proceder al pago
              </Link>
              <Link 
                to={ROUTES.catalog} 
                className="btn-outline mt-4 block w-full rounded-2xl px-6 py-3.5 text-center text-base font-bold"
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
