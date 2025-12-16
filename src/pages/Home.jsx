import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductGrid from '../components/product/ProductGrid'
import { useCart } from '../hooks/useCart'
import { getProducts } from '../services/products'
import { toArray } from '../utils/data'
import { ROUTES } from '../constants/routes'
import { ArrowRight, Package, TrendingUp, Zap } from 'lucide-react'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const { addItem } = useCart()

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const data = await getProducts({ page: 1 })
        if (!ignore) {
          const list = toArray(data)
          setProducts(list.slice(0, 8))
        }
      } catch {
        if (!ignore) setProducts([])
      } finally { if (!ignore) setLoading(false) }
    }
    load()
    return () => { ignore = true }
  }, [])

  return (
    <div className="page-anim">
      {/* Banner principal limpio y elegante */}
      <section className="container-responsive py-8 sm:py-12">
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 p-8 sm:p-12 lg:p-16 border border-gray-200 dark:border-gray-800 shadow-lg">
          {/* Patrón de fondo sutil */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />
          </div>
          
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6 text-gray-900 dark:text-gray-300">
              <Zap className="h-3.5 w-3.5" />
              SmartSales365
            </div>
            
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.1] mb-6 text-gray-900 dark:text-white">
              Compra inteligente.<br />
              Entrega rápida.
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 font-medium mb-8 max-w-2xl leading-relaxed">
              Miles de productos verificados con envío express y garantía extendida. Tu tienda online que funciona como una física.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                to={ROUTES.catalog}
                className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--primary))] dark:bg-[hsl(var(--primary))] px-6 py-3.5 text-base font-bold text-white hover:bg-[hsl(var(--primary-hover))] transition-colors shadow-md"
              >
                Explorar catálogo
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to={ROUTES.promociones}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-3.5 text-base font-bold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
              >
                Ver ofertas
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              {[
                { icon: Package, label: 'Envío 24-48h', value: 'gratis >$50' },
                { icon: TrendingUp, label: 'Productos', value: '+2,500' },
                { icon: Zap, label: 'Atención', value: '24/7' }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <item.icon className="h-5 w-5 text-gray-900 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="font-bold text-base text-gray-900 dark:text-white">{item.value}</p>
                    <p className="text-gray-700 dark:text-gray-400 text-xs">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products con nuevo diseño */}
      <section className="container-responsive py-10 sm:py-14">
        <div className="mb-8 sm:mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3">
            Productos <span className="gradient-text">destacados</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto">
            Selección curada de lo más vendido esta semana
          </p>
        </div>
        {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl skeleton-shimmer shadow-md" />
          ))}
        </div>
        ) : (
          <>
            <ProductGrid products={products} onAdd={addItem} />
            <div className="mt-10 text-center">
              <Link 
                to={ROUTES.catalog}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 px-6 py-3 text-base font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 transition-all group"
              >
                Ver todo el catálogo
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Features Section - rediseñada más limpia */}
      <section className="container-responsive pb-12 sm:pb-16">
        <div className="rounded-3xl border border-[rgb(var(--border-rgb))]/20 bg-[rgb(var(--card))] p-8 sm:p-12">
          <div className="mb-8 text-center">
            <h3 className="text-2xl sm:text-3xl font-black mb-2">¿Por qué elegirnos?</h3>
            <p className="text-gray-600 dark:text-gray-400">Compra con confianza y sin complicaciones</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[{
              title: 'Envío exprés',
              copy: 'Entregas en 24-48h a todo el país con seguimiento en tiempo real.',
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )
            }, {
              title: 'Garantía total',
              copy: '30 días para cambios y devoluciones sin preguntas incómodas.',
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )
            }, {
              title: 'Soporte 24/7',
              copy: 'Equipo disponible por chat, email y teléfono cuando lo necesites.',
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )
            }].map((item) => (
              <div key={item.title} className="group text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] transition-transform group-hover:scale-105">
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
