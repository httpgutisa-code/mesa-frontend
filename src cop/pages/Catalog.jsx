import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ProductGrid from '../components/product/ProductGrid'
import FiltersSidebar from '../components/common/FiltersSidebar'
import Pagination from '../components/common/Pagination'
import { useCart } from '../hooks/useCart'
import { getProducts, getCategories } from '../services/products'
import { toArray } from '../utils/data'
import SortSelect from '../components/common/SortSelect'
import PageTitle from '../components/common/PageTitle'
import { ShoppingBag } from 'lucide-react'

export default function Catalog() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const page = Number(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const ordering = searchParams.get('ordering') || '-fecha_creacion'
  const categoria = searchParams.get('categoria') || ''
  const [totalPages, setTotalPages] = useState(1)
  const { addItem } = useCart()

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      try {
        const data = await getProducts({ page, search, ordering, categoria })
        if (!ignore) {
          const list = toArray(data)
          setProducts(list)
          const count = data?.count
          // Paginación estándar DRF: 20 por página por defecto
          setTotalPages(count ? Math.max(1, Math.ceil(count / 20)) : 1)
        }
      } catch {
        if (!ignore) setProducts([])
      } finally { if (!ignore) setLoading(false) }
    }
    load()
    return () => { ignore = true }
  }, [page, search, ordering, categoria])

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const data = await getCategories()
        if (!ignore) setCategories(toArray(data))
      } catch {
        if (!ignore) setCategories([])
      }
    })()
    return () => { ignore = true }
  }, [])

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next, { replace: true })
  }

  const onSortChange = (ord) => {
    const next = new URLSearchParams(searchParams)
    next.set('ordering', ord)
    next.set('page', '1')
    setSearchParams(next)
  }

  const onFiltersChange = ({ categoria: catId }) => {
    const next = new URLSearchParams(searchParams)
    if (!catId) next.delete('categoria')
    else next.set('categoria', String(catId))
    next.set('page', '1')
    setSearchParams(next)
  }

  return (
    <div className="container-responsive py-6 sm:py-8 md:py-10 page-anim">
      <PageTitle
        icon={<ShoppingBag className="h-7 w-7" />}
        eyebrow="Shop"
        title={search ? `Resultados para "${search}"` : 'Explora nuestra tienda'}
        subtitle={search ? 'Mostrando sugerencias relacionadas a tu búsqueda.' : 'Promociones activas, lanzamientos y básicos siempre disponibles.'}
        actions={<SortSelect value={ordering} onChange={onSortChange} />}
      />
      {search && (
        <button
          onClick={() => {
            const next = new URLSearchParams(searchParams)
            next.delete('search'); next.set('page', '1')
            setSearchParams(next)
          }}
          className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--primary))] hover:underline"
        >
          Limpiar búsqueda
        </button>
      )}

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        <FiltersSidebar categories={categories} selectedCategoria={categoria} onChange={onFiltersChange} />
        <div className="flex-1 min-w-0">
          {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl skeleton-shimmer shadow-md" />
            ))}
          </div>
          ) : products.length === 0 ? (
            <div className="card-surface p-12 sm:p-16 text-center border-2 border-dashed border-[hsl(var(--primary))]/20 rounded-3xl">
              <div className="mx-auto mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10">
                <svg className="h-10 w-10 sm:h-12 sm:w-12 text-[hsl(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="mb-3 text-2xl sm:text-3xl font-black">No encontramos productos</h2>
              <p className="text-base sm:text-lg text-gray-800 dark:text-gray-400 mb-8 font-medium max-w-md mx-auto">
                Intenta ajustar tus filtros o búsqueda para encontrar lo que necesitas
              </p>
              <button
                onClick={() => {
                  const next = new URLSearchParams(searchParams)
                  next.delete('search'); next.delete('categoria'); next.set('page','1')
                  setSearchParams(next)
                }}
                className="btn-primary rounded-2xl px-8 py-4 text-base font-bold shadow-[0_8px_24px_rgba(0,128,255,0.35)]"
              >
                Limpiar todos los filtros
              </button>
            </div>
          ) : (
            <ProductGrid products={products} onAdd={addItem} />
          )}
          {!loading && products.length > 0 && (
            <Pagination page={page} total={totalPages} onPageChange={setPage} />
          )}
        </div>
      </div>
    </div>
  )
}

// Sin datos de ejemplo: si falla la carga, se mostrará el estado vacío y CTA para limpiar filtros.
