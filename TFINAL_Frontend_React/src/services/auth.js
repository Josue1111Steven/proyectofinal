import { api } from './api.js'

export async function login(email, password) {
  const data = await api.post('/auth/login', { email, password })
  if (data?.token) localStorage.setItem('token', data.token)
  return data
}

export function logout() {
  localStorage.removeItem('token')
}

export function isAuthenticated() {
  return !!localStorage.getItem('token')
}
