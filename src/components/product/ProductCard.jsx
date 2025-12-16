import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/format'
import { ROUTES } from '../../constants/routes'

export default function ProductCard({ product, onAdd }) {
  const id = product?.id
  const to = ROUTES.product.replace(':id', String(id || '1'))
  const nombre = product?.nombre || product?.name || 'Producto'
  const precio = product?.precio ?? product?.price ?? 0
  const stock = product?.stock
  // Imagen por defecto si no existe
  const image = product?.image || product?.imagen || 'https://placehold.co/600x600?text=Producto'
  
  return (
    <div className="group overflow-hidden rounded-2xl card-surface relative transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,128,255,0.15)] hover:-translate-y-2">
      <Link to={to} className="block aspect-square overflow-hidden bg-gradient-to-br from-surface-hover to-transparent relative">
        <img
          src={image}
          alt={nombre}
          className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
          loading="lazy"
        />
        {/* Overlay elegante con gradiente en hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
        
        {/* Badge de stock bajo mejorado */}
        {typeof stock === 'number' && stock > 0 && stock <= 5 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
            ¡Solo {stock}!
          </div>
        )}
        {typeof stock === 'number' && stock === 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
            Agotado
          </div>
        )}
        
        {/* Ícono de vista rápida en hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className="bg-white/90 dark:bg-[rgb(var(--card))]/90 backdrop-blur-md rounded-full p-3 shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
            <svg className="h-6 w-6 text-[hsl(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>
      </Link>
      
      <div className="space-y-4 p-4">
        <Link 
          to={to} 
          className="block text-sm sm:text-base line-clamp-2 font-bold hover:text-[hsl(var(--primary))] transition-colors min-h-[2.5rem] sm:min-h-[1.5rem] leading-tight"
        >
          {nombre}
        </Link>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-2xl font-bold text-[hsl(var(--primary))] whitespace-nowrap leading-none">
              {formatPrice(Number(precio))}
            </span>
          </div>
          <button
            onClick={() => onAdd?.(product)}
            disabled={stock === 0}
            className="group/btn inline-flex items-center justify-center gap-2 rounded-xl md:rounded-full w-full md:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold tracking-wide text-white bg-[hsl(var(--primary))] shadow-[0_8px_20px_rgba(0,128,255,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed md:px-5 md:py-2 md:bg-transparent md:text-[hsl(var(--primary))] md:border md:border-[hsl(var(--primary))]/40 md:shadow-none md:hover:bg-[hsl(var(--primary))]/10"
          >
            {stock === 0 ? (
              'Agotado'
            ) : (
              <>
                <svg className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Añadir
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
