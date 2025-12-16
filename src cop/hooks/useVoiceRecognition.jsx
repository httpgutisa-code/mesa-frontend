import { useState, useEffect, useRef } from 'react'

/**
 * Hook para reconocimiento de voz usando Web Speech API
 * Funciona solo en HTTPS (Vercel lo proporciona automáticamente)
 */
export function useVoiceRecognition(onResult, onError) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Verificar soporte del navegador
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)
    
    // Crear instancia del reconocimiento
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'es-ES' // Español de España, cambiar a 'es-MX' o 'es-AR' si prefieres

    // Event listeners
    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setTranscript(transcript)
      if (onResult) {
        onResult(transcript)
      }
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      if (onError) {
        onError(event.error)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [onResult, onError])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        // Ya está escuchando o hay un error
        console.log('Error al iniciar reconocimiento:', error)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening
  }
}

