import React, { useState } from 'react'
import API from '../api'
import { Link } from 'react-router-dom'

export default function Recover() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try {
      const res = await API.post('auth/recover', { email })
      setMsg(res.demoResetToken ? `Token (demo): ${res.demoResetToken}` : 'Se o e-mail existe, instruções foram enviadas.')
    } catch {
      setMsg('Erro ao solicitar recuperação.')
    } finally { setLoading(false) }
  }

  return (
    <section className="container" style={{ maxWidth: 520, marginTop: 40 }}>
      <h2>Recuperar senha</h2>
      <form onSubmit={submit} className="post-form">
        <label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <div style={{ marginTop: 8 }}>
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Aguarde...' : 'Solicitar recuperação'}</button>
          <Link to="/login" style={{ marginLeft: 8 }}>Voltar</Link>
        </div>
      </form>
      {msg && <div style={{ marginTop: 12 }}>{msg}</div>}
    </section>
  )
}