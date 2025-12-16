import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

/**
 * PullToRefreshIndicator - Indicador visual de "pull to refresh" para PWA
 * Muestra un hint visual cuando el usuario está en la parte superior de la página
 * Solo visible en móvil y cuando no hay scroll
 */
export default function PullToRefreshIndicator() {
  const [isAtTop, setIsAtTop] = useState(true)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    // Solo mostrar en móvil
    const isMobile = window.innerWidth < 768

    if (!isMobile) return

    // Mostrar hint después de 3 segundos si está arriba
    const hintTimer = setTimeout(() => {
      if (isAtTop && window.scrollY === 0) {
        setShowHint(true)
        // Ocultar después de 3 segundos
        setTimeout(() => setShowHint(false), 3000)
      }
    }, 3000)

    const handleScroll = () => {
      const atTop = window.scrollY < 50
      setIsAtTop(atTop)
      if (!atTop) setShowHint(false)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      clearTimeout(hintTimer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isAtTop])

  // No mostrar si no está arriba o no debe mostrar hint
  if (!showHint) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[50] pointer-events-none">
      <div className="pull-to-refresh-hint flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500">
        <RefreshCw className="h-5 w-5" strokeWidth={2} />
        <span className="text-xs font-medium">Desliza para actualizar</span>
      </div>
    </div>
  )
}

