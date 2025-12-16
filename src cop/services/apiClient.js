import axios from 'axios'
import { startLoading, stopLoading } from '../utils/loadingBus'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  // JWT Auth no requiere cookies
  withCredentials: false,
})

// Attach JWT Bearer token if present
api.interceptors.request.use((config) => {
  try { startLoading() } catch {}
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  
  // DEBUG: Log request details AFTER adding token
  console.log('🔍 Axios Request:', {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    authHeader: config.headers.Authorization ? 'Bearer [TOKEN]' : 'MISSING',
    headers: config.headers,
    data: config.data
  });
  
  return config
})

// Variable para evitar loops infinitos en refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (res) => {
    try { stopLoading() } catch {}
    console.log('✅ Axios Response:', res.status, res.data);
    return res
  },
  async (err) => {
    try { stopLoading() } catch {}
    
    // DEBUG: Log error details
    console.error('❌ Axios Error:', {
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      data: err?.response?.data,
      headers: err?.response?.headers,
      config: {
        url: err?.config?.url,
        method: err?.config?.method,
        headers: err?.config?.headers,
        data: err?.config?.data
      }
    });
    
    const originalRequest = err.config

    // Handle 401 errors - Token Refresh
    if (err?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya estamos refrescando, poner en cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      
      if (!refreshToken) {
        // No hay refresh token, logout
        try {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        } catch {}
        
        try {
          const here = window.location?.pathname + window.location?.search
          sessionStorage.setItem('post_login_redirect', here)
          const path = '/login'
          if (!window.location.pathname.startsWith(path)) {
            window.location.assign(path)
          }
        } catch {}
        
        return Promise.reject(err)
      }

      try {
        // Intentar refrescar el token
        const { data } = await axios.post(`${API_URL}/api/usuarios/token/refresh/`, {
          refresh: refreshToken
        })

        const newAccessToken = data.access
        localStorage.setItem('accessToken', newAccessToken)
        
        // Actualizar el header de la request original
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        
        processQueue(null, newAccessToken)
        isRefreshing = false
        
        // Reintentar la request original
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh falló, logout
        processQueue(refreshError, null)
        isRefreshing = false
        
        try {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        } catch {}
        
        try {
          const here = window.location?.pathname + window.location?.search
          sessionStorage.setItem('post_login_redirect', here)
          const path = '/login'
          if (!window.location.pathname.startsWith(path)) {
            window.location.assign(path)
          }
        } catch {}
        
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(err)
  },
)

export default api
