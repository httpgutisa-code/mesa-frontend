import { useState, useEffect } from 'react'
import { Download, X, Sparkles } from 'lucide-react'

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Capturar el evento beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Mostrar el prompt después de un delay (para no ser intrusivo)
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa_prompt_dismissed')
        const dismissedTime = localStorage.getItem('pwa_prompt_dismissed_time')
        
        // Si fue cerrado, no mostrarlo por 7 días
        if (dismissed && dismissedTime) {
          const daysSince = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24)
          if (daysSince < 7) return
        }
        
        setShowPrompt(true)
      }, 8000) // 8 segundos después de cargar (menos invasivo)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Detectar si se instaló
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      localStorage.removeItem('pwa_prompt_dismissed')
      localStorage.removeItem('pwa_prompt_dismissed_time')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('PWA instalada')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_prompt_dismissed', 'true')
    localStorage.setItem('pwa_prompt_dismissed_time', Date.now().toString())
  }

  if (isInstalled || !showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-sm animate-slide-up">
      <div className="relative rounded-2xl border border-[hsl(var(--primary))]/20 bg-[rgb(var(--card))] p-4 shadow-2xl backdrop-blur-xl">
        {/* Botón de cerrar más sutil */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--card))] border border-subtle shadow-md hover:bg-surface-hover transition-all active:scale-95"
          aria-label="Cerrar"
        >
          <X className="h-3.5 w-3.5 text-gray-500" />
        </button>

        <div className="flex items-start gap-3">
          {/* Icono con gradiente */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] shadow-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-semibold text-sm mb-1">¿Instalar SmartSales?</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
              Acceso rápido desde tu pantalla de inicio
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="btn-primary flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
              >
                <Download className="h-3.5 w-3.5" />
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="btn-ghost inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400"
              >
                Más tarde
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

