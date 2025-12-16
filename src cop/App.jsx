import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ROUTES } from './constants/routes'
import AppLayout from './layouts/AppLayout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Account from './pages/Account'
import Login from './pages/Login'
import Register from './pages/Register'
import Promociones from './pages/Promociones'
import NotFound from './pages/NotFound'
import ProtectedRoute from './routes/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import { subscribeToPushNotifications, isNotificationSupported } from './services/notifications'

export default function App() {
  const { user } = useAuth()

  // Suscribirse a notificaciones push cuando el usuario inicia sesión
  useEffect(() => {
    if (!user) return

    // Solo intentar suscribirse si el navegador lo soporta
    if (!isNotificationSupported()) {
      console.log('Notificaciones push no soportadas en este navegador')
      return
    }

    // Intentar suscribirse automáticamente (silenciosamente)
    const token = localStorage.getItem('auth_token')
    if (token) {
      subscribeToPushNotifications(token).catch((error) => {
        console.log('No se pudo suscribir automáticamente a notificaciones:', error)
        // No mostrar error al usuario, es una funcionalidad opcional
      })
    }
  }, [user])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}> 
          <Route element={<ProtectedRoute />}>
            <Route index element={<Home />} />
            <Route path={ROUTES.catalog} element={<Catalog />} />
            <Route path={ROUTES.product} element={<ProductDetail />} />
            <Route path={ROUTES.promociones} element={<Promociones />} />
            <Route path={ROUTES.cart} element={<Cart />} />
            <Route path={ROUTES.checkout} element={<Checkout />} />
            <Route path={ROUTES.orders} element={<Orders />} />
            <Route path={ROUTES.orderDetail} element={<OrderDetail />} />
            <Route path={ROUTES.account} element={<Account />} />
          </Route>
          <Route path={ROUTES.login} element={<Login />} />
          <Route path={ROUTES.register} element={<Register />} />
          <Route path="/home" element={<Navigate to={ROUTES.home} replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
