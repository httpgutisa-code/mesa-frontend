// Servicio de Notificaciones Push
// SmartSales365

const API_URL = import.meta.env.VITE_API_URL || 'https://smartsales365.duckdns.org'

// Convertir Base64 a Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Convertir ArrayBuffer a Base64
function arrayBufferToBase64(buffer) {
  if (!buffer) return ''
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

// Obtener clave pública VAPID del backend
export async function getVapidPublicKey() {
  try {
    const response = await fetch(`${API_URL}/api/notificaciones/vapid-public-key/`)
    if (!response.ok) {
      throw new Error('No se pudo obtener la clave VAPID')
    }
    const data = await response.json()
    return data.publicKey || data.public_key
  } catch (error) {
    console.error('Error obteniendo clave VAPID:', error)
    throw error
  }
}

// Verificar si las notificaciones están soportadas
export function areNotificationsSupported() {
  return 'Notification' in window &&
         'serviceWorker' in navigator &&
         'PushManager' in window
}

// Suscribirse a notificaciones push
export async function subscribeToPushNotifications(token) {
  if (!areNotificationsSupported()) {
    console.warn('Notificaciones push no soportadas en este navegador')
    return false
  }

  try {
    // 1. Solicitar permiso
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Permiso de notificaciones denegado')
      return false
    }

    // 2. Registrar service worker
    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    // 3. Obtener clave VAPID
    const vapidPublicKey = await getVapidPublicKey()
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

    // 4. Suscribirse al push manager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })

    // 5. Enviar suscripción al backend
    const response = await fetch(`${API_URL}/api/notificaciones/subscriptions/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth')),
        user_agent: navigator.userAgent
      })
    })

    if (!response.ok) {
      throw new Error('Error registrando suscripción en el servidor')
    }

    console.log('✅ Suscripción a notificaciones exitosa')
    return true
  } catch (error) {
    console.error('Error suscribiéndose a notificaciones:', error)
    return false
  }
}

// Verificar si ya está suscrito
export async function isSubscribed() {
  if (!areNotificationsSupported()) return false

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) return false

    const subscription = await registration.pushManager.getSubscription()
    return subscription !== null
  } catch (error) {
    console.error('Error verificando suscripción:', error)
    return false
  }
}

// Desuscribirse
export async function unsubscribeFromPush(token) {
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) return false

    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return false

    // Desuscribir del navegador
    await subscription.unsubscribe()

    // Notificar al backend
    await fetch(`${API_URL}/api/notificaciones/subscriptions/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`
      }
    })

    console.log('✅ Desuscripción exitosa')
    return true
  } catch (error) {
    console.error('Error desuscribiéndose:', error)
    return false
  }
}
