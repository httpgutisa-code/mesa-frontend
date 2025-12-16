import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/common/Input'

export default function Login() {
  const navigate = useNavigate()
  const { user, login, setError, error } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await login(form)
      // Redirect to intended path if stored by 401 handler
      const intended = sessionStorage.getItem('post_login_redirect')
      if (intended) {
        sessionStorage.removeItem('post_login_redirect')
        navigate(intended, { replace: true })
      } else {
        navigate(ROUTES.account)
      }
    } catch (err) {
      // El contexto ya intentó inferir el mensaje del backend; si no, muestra uno genérico
      if (!error) setError('Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  // If already logged and is cliente, redirect away from login
  if (user && user.rol === 'cliente') {
    navigate(ROUTES.account)
  }

  return (
    <div className="container-responsive flex min-h-[calc(100vh-8rem)] items-center justify-center py-6 sm:py-10 page-anim">
      <div className="w-full max-w-md">
        {/* Card principal premium */}
        <div className="card-surface p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,128,255,0.15)] border-2 border-[hsl(var(--primary))]/10">
          {/* Header con logo mejorado */}
          <div className="mb-8 sm:mb-10 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] shadow-[0_8px_24px_rgba(0,128,255,0.35)] mb-5 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
              <span className="text-white font-black text-3xl relative z-10">S</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mb-2">Bienvenido de nuevo</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">Inicia sesión para continuar tu experiencia</p>
          </div>

          {/* Formulario premium */}
          <form className="space-y-5 sm:space-y-6" onSubmit={onSubmit}>
            <Input
              label="Usuario o Email"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Tu usuario o email"
              required
              autoComplete="username"
            />
            <Input
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            
            {/* Error message premium */}
            {error && (
              <div className="rounded-xl bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 border-2 border-red-200 dark:border-red-800 p-4 shadow-sm">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-red-300 font-semibold">{error}</p>
                </div>
              </div>
            )}
            
            <Button type="submit" disabled={loading} className="w-full py-4 sm:py-3.5 text-base font-bold shadow-[0_8px_20px_rgba(0,128,255,0.35)]">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Entrando...
                </span>
              ) : 'Iniciar sesión'}
            </Button>
          </form>
        </div>

        {/* Footer con enlace a registro */}
        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes cuenta?{' '}
            <Link 
              to={ROUTES.register} 
              className="text-[hsl(var(--primary))] hover:underline font-semibold underline-offset-4"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
