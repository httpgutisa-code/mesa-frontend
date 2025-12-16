import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import Button from '../ui/Button'

export default function NotificationPrompt({ token }) {
  const { supported, subscribed, loading, subscribe } = usePushNotifications(token)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const isDismissed = localStorage.getItem('notification_prompt_dismissed')
    if (isDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleSubscribe = async () => {
    const success = await subscribe()
    if (success) {
      setDismissed(true)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('notification_prompt_dismissed', 'true')
  }

  // No mostrar si no está soportado, ya está suscrito, o fue desm...
    if (!supported || subscribed || dismissed) {
    return null
  }

  return (
    <div className="relative rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent p-4 shadow-sm animate-in slide-in-from-top-2 fade-in">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10">
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Activa las notificaciones</h3>
          <p className="text-sm text-[rgb(var(--muted))] mb-3">
            Recibe alertas cuando tus pedidos cambien de estado o haya nuevas promociones.
          </p>
          
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            size="sm"
          >
            {loading ? 'Activando...' : 'Activar notificaciones'}
          </Button>
        </div>
      </div>
    </div>
  )
}
