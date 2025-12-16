import { Download } from 'lucide-react'
import usePWAInstall from '../../hooks/usePWAInstall'

export default function InstallPWAButton({ className = '' }) {
  const { isInstallable, installed, promptInstall } = usePWAInstall()

  if (installed) return null
  if (!isInstallable) return null

  return (
    <button
      onClick={promptInstall}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/20 active:scale-[0.98] transition ${className}`}
      title="Instalar aplicación"
    >
      <Download className="h-4 w-4" />
      Descargar app
    </button>
  )
}
