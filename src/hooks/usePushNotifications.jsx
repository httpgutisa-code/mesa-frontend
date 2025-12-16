import { useState, useEffect } from 'react'
import { 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications,
  getSubscriptionStatus,
  isNotificationSupported 
} from '../services/notifications'

export function usePushNotifications(token) {
  const [subscribed, setSubscribed] = useState(false)
  const [supported, setSupported] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Verificar soporte
    setSupported(isNotificationSupported())
    
    // Verificar estado de suscripción
    if (isNotificationSupported() && token) {
      getSubscriptionStatus().then(status => {
        setSubscribed(status.subscribed)
      })
    }
  }, [token])

  const subscribe = async () => {
    if (!token) return false
    
    setLoading(true)
    try {
      const result = await subscribeToPushNotifications(token)
      if (result.success) {
        setSubscribed(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Error al suscribirse:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      const result = await unsubscribeFromPushNotifications()
      if (result.success) {
        setSubscribed(false)
        return true
      }
      return false
    } catch (error) {
      console.error('Error al desuscribirse:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    subscribed,
    supported,
    loading,
    subscribe,
    unsubscribe
  }
}
