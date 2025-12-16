import api from './apiClient'

// Django DRF token endpoint expects username & password, returns { token }
export async function login({ username, password }) {
  try {
    // Asegura limpiar tokens previos antes de intentar login
    try { localStorage.removeItem('auth_token') } catch {}
    const { data } = await api.post(
      '/usuarios/token/',
      { username, password },
      { headers: { Accept: 'application/json' } },
    )
    if (data?.token) localStorage.setItem('auth_token', data.token)
    return data
  } catch (err) {
    // Fallback por si el backend exige form-urlencoded
    const status = err?.response?.status
    if (status === 415 || status === 400) {
      const form = new URLSearchParams()
      form.append('username', username)
      form.append('password', password)
      const { data } = await api.post('/usuarios/token/', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      })
      if (data?.token) localStorage.setItem('auth_token', data.token)
      return data
    }
    throw err
  }
}

export async function register(payload) {
  // Backend returns 200 with no body according to spec
  const { data } = await api.post('/usuarios/register/', payload)
  return data
}

export async function me() {
  const { data } = await api.get('/usuarios/me/')
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.patch('/usuarios/me/', payload)
  return data
}

export function logout() {
  localStorage.removeItem('auth_token')
}
