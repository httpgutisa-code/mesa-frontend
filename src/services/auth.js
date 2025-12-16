import api from './apiClient'

// Django JWT token endpoint expects username & password, returns { access, refresh, user }
export async function login({ username, password }) {
  try {
    // Clear any previous tokens
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    const { data } = await api.post(
      '/usuarios/token/',
      { username, password },
      { headers: { 'Content-Type': 'application/json' } }
    )
    
    // Store JWT tokens and user data
    if (data?.access) {
      localStorage.setItem('accessToken', data.access)
      localStorage.setItem('refreshToken', data.refresh)
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    }
    
    return data
  } catch (err) {
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
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}
