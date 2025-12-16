import { useEffect, useState } from 'react'
import { Mic, MicOff, X, ShoppingCart, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { useVoiceCommands } from './VoiceCommandProvider'
import { formatPrice } from '../../utils/format'

export default function VoiceFab() {
  const { isSupported, isListening, startListening, stopListening, lastTranscript, candidates, processing, clearCandidates, processText } = useVoiceCommands()
  const [open, setOpen] = useState(false)
  const [addedFlash, setAddedFlash] = useState(null)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    if (isListening) setOpen(true)
  }, [isListening])

  // Permite abrir el panel desde otros lugares (ej: botón del sidebar)
  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener('openVoicePanel', onOpen)
    return () => window.removeEventListener('openVoicePanel', onOpen)
  }, [])

  useEffect(() => {
    const onFeedback = (e) => {
      if (e?.detail?.type === 'added') {
        setAddedFlash({ qty: e.detail.quantity, name: e.detail.productName })
        setTimeout(() => setAddedFlash(null), 1400)
      }
    }
    window.addEventListener('voiceFeedback', onFeedback)
    return () => window.removeEventListener('voiceFeedback', onFeedback)
  }, [])

  useEffect(() => {
    if (isListening) {
      setShowHint(true)
      const t = setTimeout(() => setShowHint(false), 2200)
      return () => clearTimeout(t)
    }
  }, [isListening])

  const haptic = (type = 'light') => {
    if ('vibrate' in navigator) {
      if (type === 'light') navigator.vibrate(10)
      if (type === 'toggle') navigator.vibrate([10, 20])
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <div
        className="fixed right-4 sm:right-6 z-[9997]"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)' }}
      >
        {/* Tooltip / pista */}
        <div className="mb-2 flex justify-end">
          {showHint && (
            <div className="rounded-full bg-[rgb(var(--card))] border border-subtle px-3 py-1 text-xs shadow-md text-gray-700 dark:text-gray-200">
              {isListening ? 'Escuchando… di: "agrega 1 aire acondicionado LG"' : 'Hablar'}
            </div>
          )}
        </div>

        {/* Anillo pulsante cuando escucha */}
        <div className="relative">
          {isListening && (
            <span className="absolute inset-0 -m-1 rounded-full bg-[hsl(var(--primary))]/40 animate-ping" />
          )}
          <button
            onClick={() => {
              setOpen(true)
              if (isSupported) {
                isListening ? stopListening() : startListening()
                haptic('toggle')
              }
            }}
            className={`relative inline-flex h-14 w-14 items-center justify-center rounded-full shadow-lg active:scale-95 transition focus:outline-none focus:ring-4 ${isSupported ? 'bg-[hsl(var(--primary))] text-white focus:ring-[hsl(var(--primary))]/30' : 'bg-gray-500 text-white focus:ring-gray-400/40'}`}
            aria-label={isSupported ? (isListening ? 'Detener micrófono' : 'Iniciar micrófono') : 'Asistente de voz (entrada manual)'}
            title={isSupported ? (isListening ? 'Detener micrófono' : 'Iniciar micrófono') : 'Micrófono no soportado: usa comandos por texto'}
          >
            {addedFlash ? (
              <span className="absolute inset-0 grid place-items-center">
                <CheckCircle className="h-6 w-6 text-white animate-in fade-in" />
              </span>
            ) : isSupported && isListening ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Panel inferior */}
      {open && (
        <div className="fixed inset-0 z-[119]" aria-modal="true" role="dialog">
          <div
            className="absolute inset-0 bg-black/40" 
            onClick={() => { setOpen(false); stopListening(); }}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-[rgb(var(--card))] shadow-2xl p-4 sm:p-5 max-h-[65vh] overflow-y-auto">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-semibold">Asistente de voz</div>
              <button onClick={() => { setOpen(false); stopListening(); }} className="rounded-lg p-1.5 hover:bg-surface-hover">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Estado de escucha */}
            <div className="mb-3 rounded-lg border border-subtle p-3">
              <div className="flex items-center gap-2 text-sm">
                {isSupported && isListening ? (
                  <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
                ) : (
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-gray-400" />
                )}
                <span className="font-medium">
                  {isSupported ? (isListening ? 'Escuchando…' : 'Micrófono apagado') : 'Micrófono no soportado'}
                </span>
              </div>
              {isSupported && lastTranscript && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  “{lastTranscript}”
                </div>
              )}
            </div>

            {/* Entrada manual siempre disponible si no hay soporte o no está escuchando */}
            {(!isSupported || !isListening) && (
              <ManualInput onSubmit={(text) => processText(text)} />
            )}

            {/* Resultados / sugerencias */}
            {processing && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando…
              </div>
            )}

            {!processing && candidates && candidates.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs uppercase tracking-wide text-gray-500">Resultados</div>
                <ul className="space-y-2">
                  {candidates.slice(0, 5).map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-subtle p-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{p.nombre || p.name}</div>
                        <div className="text-xs text-[hsl(var(--primary))] font-semibold">{formatPrice(Number(p.precio ?? p.price ?? 0))}</div>
                      </div>
                      <button
                        onClick={() => processText(`agrega 1 ${p.nombre || p.name} al carrito`)}
                        className="inline-flex items-center gap-1 rounded-md bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 active:scale-95"
                      >
                        Añadir
                      </button>
                    </li>
                  ))}
                </ul>
                <button onClick={clearCandidates} className="text-xs text-gray-500 hover:underline">Ocultar resultados</button>
              </div>
            )}

            {/* Atajos */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => processText('ver carrito')} className="rounded-lg border border-subtle p-3 text-sm font-medium hover:bg-surface-hover">
                <div className="mb-1 flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Ver carrito</div>
                <div className="text-xs text-gray-500">Revisa tus productos</div>
              </button>
              <button onClick={() => processText('ir al checkout')} className="rounded-lg border border-subtle p-3 text-sm font-medium hover:bg-surface-hover">
                <div className="mb-1 flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Ir a pagar</div>
                <div className="text-xs text-gray-500">Finaliza tu compra</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ManualInput({ onSubmit }) {
  const [value, setValue] = useState('')
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (value.trim()) { onSubmit(value.trim()); setValue('') } }}
      className="mb-2 flex items-center gap-2"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escribe un comando: ej. agrega 2 coca cola"
        className="input flex-1"
      />
      <button className="rounded-md bg-[hsl(var(--primary))] px-3 py-2 text-sm font-medium text-white hover:opacity-90 active:scale-95">Enviar</button>
    </form>
  )
}


