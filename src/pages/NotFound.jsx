import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { Home, Search, ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-responsive flex min-h-[70vh] flex-col items-center justify-center py-16 text-center page-anim">
      <div className="mx-auto max-w-md">
        {/* 404 Illustration */}
        <div className="relative mx-auto mb-8 flex h-48 w-48 items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-full bg-[hsl(var(--primary))]/10" />
          <div className="relative">
            <p className="text-8xl font-bold text-[hsl(var(--primary))]">404</p>
          </div>
        </div>

        {/* Content */}
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">Página no encontrada</p>
        <h1 className="mb-3 text-2xl font-bold sm:text-3xl">¡Oops! Esta página no existe</h1>
        <p className="mb-8 text-gray-600">
          La página que estás buscando no se encuentra disponible o fue movida a otra ubicación.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link 
            to={ROUTES.home}
            className="inline-flex items-center justify-center gap-2 rounded-lg btn-primary px-6 py-3 font-semibold shadow-sm transition-transform hover:scale-105"
          >
            <Home className="h-5 w-5" />
            Volver al inicio
          </Link>
          <Link 
            to={ROUTES.catalog}
            className="inline-flex items-center justify-center gap-2 rounded-lg btn-outline px-6 py-3 font-semibold"
          >
            <ShoppingBag className="h-5 w-5" />
            Ver productos
          </Link>
        </div>

        {/* Suggestions */}
        <div className="mt-12 card-surface p-6 text-left">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Search className="h-5 w-5 text-[hsl(var(--primary))]" />
            ¿Qué puedes hacer?
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--primary))]">•</span>
              <span>Verifica la URL y asegúrate de que esté escrita correctamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--primary))]">•</span>
              <span>Usa el buscador para encontrar lo que necesitas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--primary))]">•</span>
              <span>Explora nuestro catálogo de productos</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
