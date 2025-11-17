import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await API.post('auth/login', { email, password })
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      navigate('/')
    } catch (err) {
      setError(err?.message || 'Falha ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container" style={{ maxWidth: 420, marginTop: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <img src="/logo192.png" alt="OrkRetro" style={{ width: 84 }} />
        <h2>Entrar no OrkRetro</h2>
      </div>

      <form onSubmit={submit} className="post-form">
        <label> E-mail
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>

        <label> Senha
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>

        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          <Link to="/register" className="btn ghost" style={{ alignSelf: 'center', padding: '8px 12px', textDecoration: 'none' }}>Cadastrar</Link>
        </div>

        <div style={{ marginTop: 10 }}>
          <Link to="/recover">Esqueci minha senha</Link>
        </div>
      </form>
    </section>
  )
}