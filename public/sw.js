// Service Worker para notificaciones push de SmartSales365

self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalado')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activado')
  event.waitUntil(self.clients.claim())
})

function extractOrderId(payload = {}) {
  const candidates = [
    payload.order_id,
    payload.orderId,
    payload.compra_id,
    payload.compraId,
    payload.order?.id,
    payload.compra?.id,
    payload.id_compra
  ].filter((value) => typeof value === 'number' || (typeof value === 'string' && value.trim() !== ''))

  if (candidates.length > 0) {
    return String(candidates[0]).replace(/[^0-9]/g, '')
  }

  const url = payload.url || payload.link || payload.redirect_url
  if (typeof url === 'string') {
    const match = url.match(/(?:compras|orders|ordenes|compra|order)\/(\d+)/i)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

function buildAppUrl(payload = {}) {
  const base = self.location.origin || ''
  const type = payload.type || payload.notification_type || ''
  const body = (payload.body || payload.message || '').toLowerCase()
  const title = (payload.title || '').toLowerCase()

  // URL explícita en el payload
  const rawUrl = payload.url || payload.link || payload.redirect_url
  if (typeof rawUrl === 'string' && rawUrl.trim() !== '') {
    try {
      const absolute = new URL(rawUrl, base)
      return absolute.href
    } catch (e) {
      return `${base}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`
    }
  }

  // Detectar tipo y redirigir apropiadamente
  if (/promo|promocion|oferta|descuento/.test(type + title + body)) {
    return `${base}/promociones`
  }

  if (/pago|pagado|payment|paid/.test(type + title + body)) {
    const orderId = extractOrderId(payload)
    if (orderId) {
      return `${base}/orders/${orderId}`
    }
    return `${base}/orders`
  }

  // Para pedidos, intentar extraer ID
  const orderId = extractOrderId(payload)
  if (orderId) {
    return `${base}/orders/${orderId}`
  }

  // Default: lista de pedidos
  return `${base}/orders`
}

function getNotificationType(payload) {
  const data = payload.data || payload
  const type = data.type || data.notification_type || data.intent || ''
  const body = (payload.body || payload.message || '').toLowerCase()
  const title = (payload.title || '').toLowerCase()

  // Detectar tipo por campo explícito
  if (/promo|promocion|oferta|descuento/.test(type)) return 'promo'
  if (/order|pedido|compra|purchase/.test(type)) return 'order'
  if (/pago|payment|paid/.test(type)) return 'payment'

  // Detectar por contenido del mensaje
  if (/promo|promocion|oferta|descuento/.test(title + body)) return 'promo'
  if (/pago|pagado|payment|paid|confirmado/.test(title + body)) return 'payment'
  if (/pedido|compra|order|enviado|entregado/.test(title + body)) return 'order'

  return 'order' // Default
}

function buildNotificationOptions(payload) {
  const title = payload.title || 'SmartSales365'
  const body = payload.body || payload.message || 'Nueva actualización en tu cuenta'
  const notifType = getNotificationType(payload)
  const url = buildAppUrl(payload.data || payload)

  // Acciones personalizadas según tipo de notificación
  const actions = {
    promo: [
      { action: 'open', title: 'Ver promociones', icon: '/vite.svg' },
      { action: 'close', title: 'Cerrar', icon: '/vite.svg' }
    ],
    order: [
      { action: 'open', title: 'Ver pedido', icon: '/vite.svg' },
      { action: 'close', title: 'Cerrar', icon: '/vite.svg' }
    ],
    payment: [
      { action: 'open', title: 'Ver comprobante', icon: '/vite.svg' },
      { action: 'close', title: 'Cerrar', icon: '/vite.svg' }
    ]
  }

  return {
    body,
    icon: payload.icon || '/vite.svg',
    badge: payload.badge || '/vite.svg',
    image: payload.image,
    vibrate: [80, 40, 80],
    data: {
      url,
      orderId: extractOrderId(payload.data || payload),
      intent: payload.data?.intent || payload.intent || 'order-detail',
      notificationType: notifType,
      dateOfArrival: Date.now(),
      primaryKey: payload.id || Date.now(),
      ...payload.data
    },
    actions: actions[notifType] || actions.order,
    tag: payload.tag || 'smartsales-notification',
    requireInteraction: payload.requireInteraction ?? false,
    renotify: payload.renotify ?? false
  }
}

// Escuchar eventos push
self.addEventListener('push', (event) => {
  console.log('Push recibido:', event)

  if (!event.data) {
    console.warn('Push sin datos')
    return
  }

  let payload = {}
  try {
    payload = event.data.json()
  } catch (e) {
    payload = {
      title: 'SmartSales365',
      body: event.data.text() || 'Nueva notificación'
    }
  }

  const options = buildNotificationOptions(payload)

  event.waitUntil(
    self.registration.showNotification(
      payload.title || 'SmartSales365',
      options
    )
  )
})

function openAppUrl(targetUrl) {
  const normalizedUrl = (() => {
    try {
      return new URL(targetUrl, self.location.origin).href
    } catch (e) {
      return `${self.location.origin}/`
    }
  })()

  return clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((clientList) => {
      for (const client of clientList) {
        let matchesPath = false
        const matchesExact = client.url === normalizedUrl
        if (!matchesExact && client.url) {
          try {
            const clientUrl = new URL(client.url)
            const normalized = new URL(normalizedUrl)
            matchesPath = clientUrl.origin === normalized.origin && clientUrl.pathname === normalized.pathname
          } catch (e) {
            matchesPath = false
          }
        }

        if ((matchesExact || matchesPath) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(normalizedUrl)
      }
    })
}

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Notificación clickeada:', event)
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data?.url || buildAppUrl(event.notification.data || {})

  event.waitUntil(openAppUrl(urlToOpen))
})

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('Notificación cerrada:', event.notification.tag)
})

