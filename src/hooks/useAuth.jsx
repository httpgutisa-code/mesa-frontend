import { createContext, useContext, useEffect, useState } from 'react'
import { login as apiLogin, logout as apiLogout, me as apiMe } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    async function init() {
      // Check for JWT access token
      const token = localStorage.getItem('accessToken')
      const storedUser = localStorage.getItem('user')
      
      if (!token) { setLoading(false); return }
      
      // Try to use stored user first
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          if (!ignore) setUser(userData)
          setLoading(false)
          return
        } catch {}
      }
      
      // If no stored user, fetch from API
      try {
        const data = await apiMe()
        if (!ignore) {
          setUser(data)
          localStorage.setItem('user', JSON.stringify(data))
        }
      } catch (e) {
        if (!ignore) {
          setUser(null)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    init()
    return () => { ignore = true }
  }, [])

  const login = async ({ username, password }) => {
    setError(null)
    try {
      const res = await apiLogin({ username, password })
      
      // JWT response includes user data directly
      const userData = res.user
      
      if (userData?.rol && userData.rol !== 'cliente') {
        // Only clientes can use this frontend
        apiLogout()
        setUser(null)
        const err = new Error('Solo clientes pueden iniciar sesión en esta aplicación')
        setError(err.message)
        throw err
      }
      
      setUser(userData)
      return res
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.non_field_errors?.[0] || e.message || 'Credenciales inválidas'
      setError(msg)
      throw e
    }
  }

  const logout = () => {
    apiLogout()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const data = await apiMe()
      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
    } catch (e) {
      // If refresh fails, logout
      logout()
    }
  }

  const value = { user, loading, error, login, logout, refreshUser, setError }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
