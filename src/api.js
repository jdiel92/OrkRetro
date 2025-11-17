// Wrapper simples para chamadas à API do backend.
// Se o backend não responder, retornamos fallbacks locais para manter o app funcionando.

const API = {
  async get(path) {
    const res = await fetch(`/api/${path}`)
    if (!res.ok) throw new Error('GET failed ' + path)
    return res.json()
  },
  async post(path, body) {
    const res = await fetch(`/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    })
    if (!res.ok) throw new Error('POST failed ' + path)
    return res.json()
  },
  async del(path) {
    const res = await fetch(`/api/${path}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('DELETE failed ' + path)
    return res.json()
  }
}
export default API