import { Shield, ShieldAlert } from 'lucide-react'
import { verificarGarantia } from '../../services/devoluciones'

export default function GarantiaInfo({ compra }) {
  if (!compra?.fecha) return null
  
  const info = verificarGarantia(compra.fecha)
  
  return (
    <div className={`rounded-lg p-3 text-sm ${
      info.dentroGarantia 
        ? 'callout-success'
        : 'callout-muted'
    }`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {info.dentroGarantia ? (
            <Shield className="h-5 w-5" />
          ) : (
            <ShieldAlert className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold mb-0.5">
            {info.dentroGarantia ? 'Garantía activa' : 'Garantía expirada'}
          </div>
          <div className="text-xs">
            {info.dentroGarantia 
              ? `${info.diasRestantes} ${info.diasRestantes === 1 ? 'día restante' : 'días restantes'} para devoluciones`
              : 'El período de devolución de 30 días ha finalizado'
            }
          </div>
        </div>
      </div>
    </div>
  )
}
