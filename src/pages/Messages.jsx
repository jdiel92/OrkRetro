import React, { useEffect, useState } from 'react'
import API from '../api'

// Mensagens: enviar e listar (via /api/messages)
export default function Messages() {
  const [messages, setMessages] = useState([])
  const [to, setTo] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await API.get('messages')
        setMessages(Array.isArray(data) ? data : [])
      } catch {
        setMessages([])
      }
      setLoading(false)
    }
    load()
  }, [])

  async function send(e) {
    e.preventDefault()
    if (!to.trim() || !text.trim()) return alert('Preencha destinatário e mensagem.')
    try {
      const res = await API.post('messages', { to, text })
      setMessages(prev => [res, ...prev])
      setTo('')
      setText('')
    } catch {
      // fallback local
      const novo = { id: 'm' + Date.now(), to, text, ts: Date.now() }
      setMessages(prev => [novo, ...prev])
      setTo('')
      setText('')
    }
  }

  return (
    <section className="messages-page container">
      <h2>Mensagens (simulado)</h2>
      <p>Envie mensagens que ficam salvas no backend local (db.json) ou em fallback local.</p>

      <form id="message-form" className="post-form" onSubmit={send}>
        <input value={to} onChange={e => setTo(e.target.value)} placeholder="Para (nome)" />
        <textarea value={text} onChange={e => setText(e.target.value)} rows="3" placeholder="Escreva sua mensagem" />
        <div className="form-actions"><button className="btn" type="submit">Enviar</button></div>
      </form>

      <div style={{ marginTop: 12 }}>
        {loading ? <p>Carregando...</p> : messages.length === 0 ? <p>Sem mensagens</p> : messages.map(m => (
          <div key={m.id || m.ts} className="message">
            <strong>{m.to}</strong>
            <p>{m.text}</p>
            <small>{m.ts ? new Date(m.ts).toLocaleString() : ''}</small>
          </div>
        ))}
      </div>
    </section>
  )
}