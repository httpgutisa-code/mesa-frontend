import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, User } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import SearchBar from '../common/SearchBar'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import ThemeToggle from './ThemeToggle'
import InstallPWAButton from '../common/InstallPWAButton'
import VoiceAssistant from '../common/VoiceAssistant'

export default function Navbar() {
  const { count } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Ocultar sidebar en páginas de autenticación
  const isAuthPage = location.pathname === ROUTES.login || location.pathname === ROUTES.register

  // Cerrar sidebar al navegar a login/register
  useEffect(() => {
    if (isAuthPage) {
      setMobileOpen(false)
    }
  }, [isAuthPage])

  // Bloquear scroll del body cuando el sidebar está abierto
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-[hsl(var(--primary))]/10 bg-[rgb(var(--bg))]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[rgb(var(--bg))]/70 pwa-safe-top shadow-sm">
        {/* Barra principal - diseño premium */}
        <div className="container-responsive flex h-16 md:h-18 items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Ocultar botón de menú en login/register */}
            {!isAuthPage && (
              <button 
                className="inline-flex items-center justify-center rounded-xl p-2.5 hover:bg-[hsl(var(--primary))]/10 lg:hidden active:scale-95 transition-all border border-transparent hover:border-[hsl(var(--primary))]/20"
                aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X className="h-6 w-6 text-[hsl(var(--primary))]" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
            <Link to={ROUTES.home} className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                <span className="text-white font-black text-lg">S</span>
              </div>
              <span className="font-black tracking-tight text-xl gradient-text hidden sm:inline">SmartSales</span>
            </Link>
            <nav className="hidden lg:flex lg:items-center lg:gap-1 lg:ml-2">
              <NavItem to={ROUTES.home} label="Inicio" />
              <NavItem to={ROUTES.catalog} label="Tienda" />
              <NavItem to={ROUTES.promociones} label="Promociones" />
              <NavItem to={ROUTES.orders} label="Pedidos" />
            </nav>
          </div>

          {/* Barra de búsqueda - Solo desktop con nuevo diseño */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <SearchBar
              placeholder="Buscar productos…"
              onSearch={(q) => {
                const sp = new URLSearchParams()
                if (q) sp.set('search', q)
                sp.set('page', '1')
                navigate(`${ROUTES.catalog}?${sp.toString()}`)
              }}
            />
          </div>

          {/* Botones de acción premium */}
          <div className="flex items-center gap-2">
            <InstallPWAButton />
            <div className="hidden md:flex">
              <VoiceAssistant />
            </div>
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-1">
                <NavLink to={ROUTES.account} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-[hsl(var(--primary))]/10 active:scale-95 transition-all border border-transparent hover:border-[hsl(var(--primary))]/20">
                  <User className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <span className="hidden lg:inline text-sm font-semibold">{user?.username || 'Cuenta'}</span>
                </NavLink>
                <button onClick={logout} className="hidden md:inline-flex rounded-xl px-3 py-2 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all">Salir</button>
              </div>
            ) : (
              <NavLink to={ROUTES.login} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-[hsl(var(--primary))]/10 active:scale-95 transition-all border border-transparent hover:border-[hsl(var(--primary))]/20">
                <User className="h-5 w-5 text-[hsl(var(--primary))]" />
                <span className="hidden md:inline text-sm font-semibold">Entrar</span>
              </NavLink>
            )}
            <NavLink to={ROUTES.cart} className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-[hsl(var(--primary))]/10 active:scale-95 transition-all border border-transparent hover:border-[hsl(var(--primary))]/20">
              <ShoppingCart className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="hidden md:inline text-sm font-semibold">Carrito</span>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] px-1.5 text-xs font-black text-white shadow-lg">{count}</span>
              )}
            </NavLink>
          </div>
        </div>

        {/* Barra de búsqueda móvil mejorada */}
        {!isAuthPage && (
          <div className="md:hidden border-t border-[hsl(var(--primary))]/10 bg-gradient-to-b from-transparent to-[rgb(var(--bg))]">
            <div className="container-responsive py-3">
              <SearchBar
                placeholder="   Buscar productos…"
                onSearch={(q) => {
                  const sp = new URLSearchParams()
                  if (q) sp.set('search', q)
                  sp.set('page', '1')
                  navigate(`${ROUTES.catalog}?${sp.toString()}`)
                }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu drawer - Diseño premium mejorado */}
      {mobileOpen && !isAuthPage && (
        <>
          {/* Overlay con blur premium */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998] lg:hidden animate-in fade-in"
            onClick={() => setMobileOpen(false)}
          />
          
          {/* Panel lateral premium */}
          <div className="fixed top-0 left-0 bottom-0 w-80 bg-[rgb(var(--bg))] border-r-2 border-[hsl(var(--primary))]/20 shadow-[8px_0_40px_rgba(0,128,255,0.15)] z-[9999] lg:hidden animate-in slide-in-from-left">
            <div className="flex flex-col h-full">
              {/* Header del menú con gradiente */}
              <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--primary))]/20 bg-gradient-to-r from-[hsl(var(--primary))]/10 via-[hsl(var(--accent))]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-lg">S</span>
                  </div>
                  <span className="font-black text-xl gradient-text">SmartSales</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl hover:bg-[hsl(var(--primary))]/10 active:scale-95 transition-all border border-transparent hover:border-[hsl(var(--primary))]/20"
                  aria-label="Cerrar menú"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Usuario info mejorado */}
              {user && (
                <div className="px-5 py-4 border-b border-[hsl(var(--primary))]/10 bg-gradient-to-br from-[hsl(var(--primary))]/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-md">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base truncate">{user?.username || 'Usuario'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'usuario@email.com'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navegación principal mejorada */}
              <nav className="flex-1 overflow-y-auto py-4">
                <div className="px-4 space-y-1">
                  <p className="px-4 py-2 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Navegación</p>
                  <NavLink 
                    to={ROUTES.home} 
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 hover:bg-[hsl(var(--primary))]/10 font-bold active:scale-98 transition-all border border-transparent hover:border-[hsl(var(--primary))]/20" 
                    onClick={() => setMobileOpen(false)}
                  >
                    <svg className="h-5 w-5 text-[hsl(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Inicio
                  </NavLink>
                  <NavLink 
                    to={ROUTES.catalog} 
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 hover:bg-[hsl(var(--primary))]/10 font-bold active:scale-98 transition-all border border-transparent hover:border-[hsl(var(--primary))]/20" 
                    onClick={() => setMobileOpen(false)}
                  >
                    <svg className="h-5 w-5 text-[hsl(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Tienda
                  </NavLink>
                  <NavLink 
                    to={ROUTES.promociones} 
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 hover:bg-[hsl(var(--primary))]/10 font-bold active:scale-98 transition-all border border-transparent hover:border-[hsl(var(--primary))]/20" 
                    onClick={() => setMobileOpen(false)}
                  >
                    <svg className="h-5 w-5 text-[hsl(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    Promociones
                  </NavLink>
                  <NavLink 
                    to={ROUTES.orders} 
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 hover:bg-[hsl(var(--primary))]/10 font-bold active:scale-98 transition-all border border-transparent hover:border-[hsl(var(--primary))]/20" 
                    onClick={() => setMobileOpen(false)}
                  >
                    <svg className="h-5 w-5 text-[hsl(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Mis Pedidos
                  </NavLink>
                </div>

                {/* Sección de cuenta mejorada */}
                <div className="px-4 mt-6 space-y-1">
                  <p className="px-4 py-2 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cuenta</p>
                  {user ? (
                    <>
                      <NavLink 
                        to={ROUTES.account} 
                        className="flex items-center gap-3 rounded-xl px-4 py-3.5 hover:bg-[hsl(var(--primary))]/10 font-bold active:scale-98 transition-all border border-transparent hover:border-[hsl(var(--primary))]/20" 
                        onClick={() => setMobileOpen(false)}
                      >
                        <User className="h-5 w-5 text-[hsl(var(--primary))]" />
                        Mi cuenta
                      </NavLink>
                      <button 
                        onClick={() => { setMobileOpen(false); logout() }} 
                        className="w-full flex items-center gap-3 text-left rounded-xl px-4 py-3.5 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-red-600 dark:text-red-400 active:scale-98 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <NavLink 
                      to={ROUTES.login} 
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 hover:bg-[hsl(var(--primary))]/10 font-bold active:scale-98 transition-all border border-transparent hover:border-[hsl(var(--primary))]/20" 
                      onClick={() => setMobileOpen(false)}
                    >
                      <User className="h-5 w-5 text-[hsl(var(--primary))]" />
                      Iniciar sesión
                    </NavLink>
                  )}
                </div>
              </nav>

              {/* Footer con herramientas mejorado */}
              <div className="p-5 border-t border-[hsl(var(--primary))]/20 bg-gradient-to-t from-[hsl(var(--primary))]/5 to-transparent">
                <p className="text-xs font-black text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Herramientas</p>
                <div className="flex items-center gap-2">
                  <InstallPWAButton />
                  <VoiceAssistant />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
          isActive 
            ? 'text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20' 
            : 'text-[rgb(var(--fg))]/70 hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5'
        }`
      }
    >
      {label}
    </NavLink>
  )
}
