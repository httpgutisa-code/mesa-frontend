import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  
  console.log('🛡️ ProtectedRoute check:', { user, loading });
  
  if (loading) return null
  
  // Allow any logged-in user (backend should only allow 'cliente' to login anyway)
  // If rol field exists, verify it's 'cliente', otherwise just check if user exists
  if (!user) {
    console.log('🛡️ No user, redirecting to login');
    return <Navigate to={ROUTES.login} replace />
  }
  
  if (user.rol && user.rol !== 'cliente') {
    console.log('🛡️ User has wrong role:', user.rol);
    return <Navigate to={ROUTES.login} replace />
  }
  
  console.log('🛡️ Access granted');
  return <Outlet />
}
