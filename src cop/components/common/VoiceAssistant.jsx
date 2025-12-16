import { Mic } from 'lucide-react'

export default function VoiceAssistant() {
  // Botón compacto que abre el panel del nuevo asistente de voz (VoiceFab)
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('openVoicePanel'))}
      className="relative inline-flex items-center justify-center rounded-lg p-2.5 hover-surface active:scale-95 transition"
      aria-label="Asistente de voz"
      title="Asistente de voz"
    >
      <Mic className="h-5 w-5" />
    </button>
  )
}

