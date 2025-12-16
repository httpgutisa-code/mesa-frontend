import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useState } from 'react'
import Button from '../components/ui/Button'
import Input from '../components/common/Input'
import { register as apiRegister } from '../services/auth'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    telefono: '',
  })
  const [errors, setErrors] = useState({})

  const onSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    try {
      setLoading(true)
      await apiRegister(form)
      navigate(ROUTES.login)
    } catch (e) {
      const data = e?.response?.data
      if (typeof data === 'object' && !data.detail) {
        // Field-specific errors
        setErrors(data)
      } else {
        setErrors({ general: data?.detail || 'No se pudo registrar. Verifica los datos.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-responsive flex min-h-[calc(100vh-8rem)] items-center justify-center py-6 sm:py-10 page-anim">
      <div className="w-full max-w-lg">
        {/* Card principal premium */}
        <div className="card-surface p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,128,255,0.15)] border-2 border-[hsl(var(--primary))]/10">
          {/* Header con logo mejorado */}
          <div className="mb-8 sm:mb-10 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] shadow-[0_8px_24px_rgba(0,128,255,0.35)] mb-5 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
              <span className="text-white font-black text-3xl relative z-10">S</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mb-2">Únete a SmartSales</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">Crea tu cuenta y descubre una nueva forma de comprar</p>
          </div>

          {/* Formulario premium */}
          <form className="space-y-5" onSubmit={onSubmit}>
            {/* Nombre y Apellido - Stack en móvil, grid en desktop */}
            <div className="space-y-4 sm:space-y-0 sm:grid sm:gap-4 sm:grid-cols-2">
              <Input
                label="Nombre"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="Tu nombre"
                error={errors.first_name?.[0]}
                autoComplete="given-name"
              />
              <Input
                label="Apellido"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                placeholder="Tu apellido"
                error={errors.last_name?.[0]}
                autoComplete="family-name"
              />
            </div>
            
            <Input
              label="Usuario"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Elige un nombre de usuario"
              required
              error={errors.username?.[0]}
              autoComplete="username"
            />
            
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com"
              required
              error={errors.email?.[0]}
              autoComplete="email"
            />
            
            <Input
              label="Teléfono (opcional)"
              type="tel"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="+1234567890"
              error={errors.telefono?.[0]}
              autoComplete="tel"
            />
            
            <Input
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 8 caracteres"
              required
              error={errors.password?.[0]}
              autoComplete="new-password"
              hint="Mínimo 8 caracteres"
            />
            
            {/* Error general premium */}
            {errors.general && (
              <div className="rounded-xl bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 border-2 border-red-200 dark:border-red-800 p-4 shadow-sm">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-red-300 font-semibold">{errors.general}</p>
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
                  Creando cuenta...
                </span>
              ) : 'Crear mi cuenta'}
            </Button>
          </form>
        </div>

        {/* Footer con enlace a login */}
        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link 
              to={ROUTES.login} 
              className="text-[hsl(var(--primary))] hover:underline font-semibold underline-offset-4"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
