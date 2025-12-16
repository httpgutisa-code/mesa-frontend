import api from './apiClient'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Obtener la clave pública VAPID del backend
 */
export async function getVapidPublicKey() {
  try {
    const response = await fetch(`${API_URL}/api/notificaciones/vapid-public-key/`)
    const data = await response.json()
    // Soportar ambas variantes: public_key o publicKey y limpiar espacios
    const key = data.publicKey || data.public_key || ''
    return String(key).trim()
  } catch (error) {
    console.error('Error al obtener clave VAPID:', error)
    throw error
  }
}

/**
 * Convertir clave VAPID de base64 a Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Convertir ArrayBuffer a Base64
 */
function arrayBufferToBase64(buffer) {
  if (!buffer) return ''
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

/**
 * Verificar si las notificaciones están soportadas
 */
export function isNotificationSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/**
 * Obtener el estado del permiso de notificaciones
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'denied'
  return Notification.permission
}

/**
 * Suscribirse a notificaciones push
 */
export async function subscribeToPushNotifications(token) {
  // Verificar soporte
  if (!isNotificationSupported()) {
    console.warn('Notificaciones push no soportadas en este navegador')
    return { success: false, error: 'not_supported' }
  }

  try {
    // Registrar service worker
    let registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      console.log('Service Worker registrado:', registration)
      
      // Esperar a que esté activo
      await navigator.serviceWorker.ready
    }

    // Solicitar permiso
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Permiso de notificaciones denegado')
      return { success: false, error: 'permission_denied' }
    }

    // Verificar si ya existe una suscripción
    let subscription = await registration.pushManager.getSubscription()
    
    if (!subscription) {
      // Obtener clave VAPID del backend
      const vapidPublicKey = await getVapidPublicKey()
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      // Crear nueva suscripción (con intento de recuperación)
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        })
      } catch (e) {
        // Si falla, intenta limpiar suscripción existente y reintentar una vez
        try {
          const existing = await registration.pushManager.getSubscription()
          if (existing) await existing.unsubscribe()
        } catch {}
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        })
      }
    }

    // Evitar POST innecesario si el endpoint ya fue enviado previamente desde este dispositivo
    const lastEndpoint = localStorage.getItem('push_endpoint')
    if (subscription.endpoint !== lastEndpoint) {
      try {
        await api.post('/notificaciones/subscriptions/', {
          endpoint: subscription.endpoint,
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth')),
          user_agent: navigator.userAgent
        })
        localStorage.setItem('push_endpoint', subscription.endpoint)
      } catch (e) {
        const msg = e?.response?.data
        const isDuplicate = e?.response?.status === 400 && (
          (typeof msg === 'string' && /already exists|ya existe/i.test(msg)) ||
          (msg && msg.endpoint && /already exists|ya existe/i.test(String(msg.endpoint)))
        )
        if (!isDuplicate) throw e
        // Duplicado: tratar como éxito idempotente
        localStorage.setItem('push_endpoint', subscription.endpoint)
      }
    }

    console.log('✅ Suscrito a notificaciones push')
    return { success: true, subscription }
  } catch (error) {
    console.error('Error al suscribirse a notificaciones:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Desuscribirse de notificaciones push
 */
export async function unsubscribeFromPushNotifications() {
  if (!isNotificationSupported()) {
    return { success: false, error: 'not_supported' }
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      return { success: true }
    }

    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      return { success: true }
    }

    // Desuscribirse localmente
    await subscription.unsubscribe()
    
    // Notificar al backend (opcional, el backend puede manejar suscripciones inactivas)
    try {
      await api.delete('/notificaciones/subscriptions/', {
        data: { endpoint: subscription.endpoint }
      })
    } catch (e) {
      // Si falla la eliminación en el backend, no es crítico
      console.warn('No se pudo eliminar la suscripción del backend:', e)
    }

    console.log('✅ Desuscrito de notificaciones push')
    return { success: true }
  } catch (error) {
    console.error('Error al desuscribirse:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtener el estado actual de la suscripción
 */
export async function getSubscriptionStatus() {
  if (!isNotificationSupported()) {
    return { 
      supported: false, 
      subscribed: false, 
      permission: 'denied' 
    }
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = registration 
      ? await registration.pushManager.getSubscription() 
      : null

    return {
      supported: true,
      subscribed: !!subscription,
      permission: Notification.permission,
      subscription
    }
  } catch (error) {
    console.error('Error al verificar suscripción:', error)
    return {
      supported: true,
      subscribed: false,
      permission: Notification.permission,
      error: error.message
    }
  }
}

/**
 * Mostrar notificación de prueba
 */
export async function showTestNotification() {
  if (!isNotificationSupported()) {
    throw new Error('Notificaciones no soportadas')
  }

  if (Notification.permission !== 'granted') {
    throw new Error('Sin permisos para mostrar notificaciones')
  }

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    throw new Error('Service Worker no registrado')
  }

  await registration.showNotification('SmartSales365', {
    body: '¡Las notificaciones están funcionando correctamente!',
    icon: '/vite.svg',
    badge: '/vite.svg',
    vibrate: [200, 100, 200],
    tag: 'test-notification'
  })
}

