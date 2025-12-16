import axios from 'axios'
import { startLoading, stopLoading } from '../utils/loadingBus'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Token Auth no requiere cookies; desactivar credenciales evita preflight estricto y problemas CORS
  withCredentials: false,
})

// Attach Token auth if present (Django DRF TokenAuth style)
api.interceptors.request.use((config) => {
  try { startLoading() } catch {}
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Token ${token}`
  return config
})

api.interceptors.response.use(
  (res) => {
    try { stopLoading() } catch {}
    return res
  },
  (err) => {
    try { stopLoading() } catch {}
    // Optionally handle 401s globally
    if (err?.response?.status === 401) {
      // clear invalid token
      try { localStorage.removeItem('auth_token') } catch {}
      try {
        const here = window.location?.pathname + window.location?.search
        sessionStorage.setItem('post_login_redirect', here)
        const path = '/login'
        if (!window.location.pathname.startsWith(path)) {
          window.location.assign(path)
        }
      } catch {}
    }
    return Promise.reject(err)
  },
)

export default api
