import api from './apiClient'

// JWT Auth - Django returns { access, refresh, user }
export async function login({ username, password }) {
  // Limpiar tokens previos antes de intentar login
  try {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  } catch {}

  const { data } = await api.post(
    '/usuarios/token/',
    { username, password },
    { headers: { Accept: 'application/json' } },
  )

  // Guardar access y refresh tokens
  if (data?.access) localStorage.setItem('accessToken', data.access)
  if (data?.refresh) localStorage.setItem('refreshToken', data.refresh)
  if (data?.user) localStorage.setItem('user', JSON.stringify(data.user))

  return data
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
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export function getAccessToken() {
  return localStorage.getItem('accessToken')
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken')
}

