import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) return setError('Senhas não conferem')
    setLoading(true)
    try {
      await API.post('auth/register', { name, email, password })
      navigate('/login')
    } catch (err) {
      setError(err?.message || 'Falha ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container" style={{ maxWidth: 520, marginTop: 40 }}>
      <h2>Cadastrar</h2>
      <form onSubmit={submit} className="post-form">
        <label>Nome<input value={name} onChange={e => setName(e.target.value)} required /></label>
        <label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label>Senha<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
        <label>Confirmar senha<input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required /></label>

        {error && <div style={{ color: 'crimson' }}>{error}</div>}

        <div style={{ marginTop: 8 }}>
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Criando...' : 'Criar conta'}</button>
          <Link to="/login" style={{ marginLeft: 8 }}>Já tenho conta</Link>
        </div>
      </form>
    </section>
  )
}