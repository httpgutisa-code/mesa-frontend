import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user || user.rol !== 'cliente') return <Navigate to={ROUTES.login} replace />
  return <Outlet />
}
