const useMock = (import.meta.env.VITE_USE_MOCK === 'true')
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

function headers(extra = {}) {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...extra
  }
}

// --- MOCK BACKEND (localStorage) ---
const mock = {
  _key: 'productos',
  _seed() {
    if (!localStorage.getItem(this._key)) {
      const initial = [
        { id: '1', nombre: 'Teclado', precio: 25 },
        { id: '2', nombre: 'Mouse', precio: 15 }
      ]
      localStorage.setItem(this._key, JSON.stringify(initial))
    }
  },
  async list() {
    this._seed()
    return JSON.parse(localStorage.getItem(this._key) || '[]')
  },
  async get(id) {
    const arr = await this.list()
    const item = arr.find(x => x.id === String(id))
    if (!item) throw new Error('No encontrado')
    return item
  },
  async create(data) {
    const arr = await this.list()
    const id = String(Date.now())
    const nuevo = { id, ...data }
    arr.push(nuevo)
    localStorage.setItem(this._key, JSON.stringify(arr))
    return nuevo
  },
  async update(id, data) {
    const arr = await this.list()
    const idx = arr.findIndex(x => x.id === String(id))
    if (idx === -1) throw new Error('No encontrado')
    arr[idx] = { ...arr[idx], ...data }
    localStorage.setItem(this._key, JSON.stringify(arr))
    return arr[idx]
  },
  async remove(id) {
    const arr = await this.list()
    const nxt = arr.filter(x => x.id !== String(id))
    localStorage.setItem(this._key, JSON.stringify(nxt))
    return { ok: true }
  }
}

async function http(path, options = {}) {
  const res = await fetch(`${baseURL}${path}`, { ...options, headers: headers(options.headers || {}) })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

export const api = {
  async get(path) { return useMock ? mockHandler('GET', path) : http(path) },
  async post(path, body) { return useMock ? mockHandler('POST', path, body) : http(path, { method: 'POST', body: JSON.stringify(body) }) },
  async put(path, body) { return useMock ? mockHandler('PUT', path, body) : http(path, { method: 'PUT', body: JSON.stringify(body) }) },
  async del(path) { return useMock ? mockHandler('DELETE', path) : http(path, { method: 'DELETE' }) },
}

// Simple enroutamiento mock: /productos, /productos/:id
async function mockHandler(method, path, body) {
  const segs = path.split('/').filter(Boolean)
  if (segs[0] === 'productos') {
    if (method === 'GET' && segs.length === 1) return mock.list()
    if (method === 'GET' && segs.length === 2) return mock.get(segs[1])
    if (method === 'POST' && segs.length === 1) return mock.create(body)
    if (method === 'PUT' && segs.length === 2) return mock.update(segs[1], body)
    if (method === 'DELETE' && segs.length === 2) return mock.remove(segs[1])
  }
  if (segs[0] === 'auth' && segs[1] === 'login' && method === 'POST') {
    // Credenciales demo
    if (body?.email && body?.password) {
      const token = btoa(`${body.email}:${body.password}`) // demostrativo
      localStorage.setItem('token', token)
      return { token }
    }
    throw new Error('Credenciales inválidas')
  }
  throw new Error(`Ruta mock no soportada: ${method} ${path}`)
}
