import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { updateProfile } from '../services/auth'
import { usePushNotifications } from '../hooks/usePushNotifications'
import Button from '../components/ui/Button'
import Input from '../components/common/Input'
import toast from '../utils/toastBus'
import { Bell, BellOff, CheckCircle2, UserRound } from 'lucide-react'
import PageTitle from '../components/common/PageTitle'

export default function Account() {
  const { user, refreshUser } = useAuth()
  const token = localStorage.getItem('auth_token')
  const { supported, subscribed, loading: notifLoading, subscribe, unsubscribe } = usePushNotifications(token)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile(form)
      await refreshUser()
      toast.success('Perfil actualizado')
      setEditing(false)
    } catch (e) {
      const msg = e?.response?.data?.detail || 'No se pudo actualizar el perfil'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleNotifications = async () => {
    if (subscribed) {
      const success = await unsubscribe()
      if (success) {
        toast.success('Notificaciones desactivadas')
      } else {
        toast.error('No se pudo desactivar las notificaciones')
      }
    } else {
      const success = await subscribe()
      if (success) {
        toast.success('Notificaciones activadas correctamente')
      } else {
        toast.error('No se pudo activar las notificaciones')
      }
    }
  }

  return (
    <div className="container-responsive py-8 page-anim">
      <div className="mx-auto max-w-2xl">
        <PageTitle
          icon={<UserRound className="h-7 w-7" />}
          eyebrow="Perfil"
          title="Mi cuenta"
          subtitle="Actualiza tus datos, gestiona notificaciones y mantén tu perfil al día."
        />
        
        {/* Perfil */}
        <div className="card-surface p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Información personal</h2>
          {user ? (
            <>
              {!editing ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 text-sm flex-1">
                      <p><span className="text-gray-800 dark:text-gray-500">Usuario:</span> <span className="font-medium">{user.username}</span></p>
                      <p><span className="text-gray-500">Email:</span> <span>{user.email || 'No especificado'}</span></p>
                      <p><span className="text-gray-500">Nombre:</span> <span>{[user.first_name, user.last_name].filter(Boolean).join(' ') || 'No especificado'}</span></p>
                      <p><span className="text-gray-500">Teléfono:</span> <span>{user.telefono || 'No especificado'}</span></p>
                      {user.rol && <p><span className="text-gray-500">Rol:</span> <span className="capitalize">{user.rol}</span></p>}
                    </div>
                    <Button variant="outline" onClick={() => setEditing(true)} className="ml-4">
                      Editar
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Nombre"
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      placeholder="Tu nombre"
                    />
                    <Input
                      label="Apellido"
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      placeholder="Tu apellido"
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@ejemplo.com"
                  />
                  <Input
                    label="Teléfono"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="+1234567890"
                  />
                  <div className="flex gap-3">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Guardando…' : 'Guardar cambios'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setEditing(false)
                        setForm({
                          first_name: user?.first_name || '',
                          last_name: user?.last_name || '',
                          email: user?.email || '',
                          telefono: user?.telefono || '',
                        })
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <p className="text-gray-600">No hay información de usuario.</p>
          )}
        </div>

        {/* Notificaciones Push */}
        {supported && (
          <div className="card-surface p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-[hsl(var(--primary))]" />
              Notificaciones Push
            </h2>
            
            <div className="space-y-4">
              <p className="text-sm text-[rgb(var(--muted))]">
                Recibe notificaciones en tiempo real sobre el estado de tus pedidos, devoluciones y promociones especiales.
              </p>

              {subscribed ? (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-green-700 dark:text-green-300 mb-1">
                        Notificaciones activas
                      </p>
                      <p className="text-sm text-green-600/80 dark:text-green-400/80">
                        Recibirás alertas en este dispositivo cuando haya actualizaciones importantes.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleToggleNotifications}
                    disabled={notifLoading}
                    className="mt-3 w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <BellOff className="h-4 w-4 mr-2" />
                    {notifLoading ? 'Desactivando...' : 'Desactivar notificaciones'}
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-subtle bg-surface-hover p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <BellOff className="h-5 w-5 text-[rgb(var(--muted))] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">Notificaciones desactivadas</p>
                      <p className="text-sm text-[rgb(var(--muted))]">
                        Activa las notificaciones para estar al tanto de tus pedidos.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleToggleNotifications}
                    disabled={notifLoading}
                    className="w-full sm:w-auto"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    {notifLoading ? 'Activando...' : 'Activar notificaciones'}
                  </Button>
                </div>
              )}

              <div className="rounded-lg bg-[hsl(var(--primary))]/5 border border-[hsl(var(--primary))]/10 p-3">
                <p className="text-xs text-[rgb(var(--muted))]">
                  <strong>Nota:</strong> Las notificaciones solo funcionan en este navegador y dispositivo. 
                  Si usas múltiples dispositivos, actívalas en cada uno.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
