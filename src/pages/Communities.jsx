import React, { useEffect, useState } from 'react'
import API from '../api'

// Lista comunidades e permite entrar/sair (toggle). Tenta obter estado "joined" do backend, caso exista.
export default function Communities() {
  const [comms, setComms] = useState([])
  const [joined, setJoined] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await API.get('communities')
        setComms(Array.isArray(data) ? data : [])
      } catch {
        setComms([])
      }

      // tenta obter lista de joined (endpoint opcional no backend). Se falhar, mantém array vazio.
      try {
        const joinedData = await API.get('communities/joined')
        if (Array.isArray(joinedData)) setJoined(joinedData)
      } catch {
        // fallback: tentar endpoint genérico (algumas versões usam /api/joined)
        try {
          const alt = await API.get('joined')
          if (Array.isArray(alt)) setJoined(alt)
        } catch {
          setJoined([])
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function toggle(id) {
    try {
      const res = await API.post(`communities/${id}/join`)
      if (res && res.joined !== undefined) {
        setJoined(prev => res.joined ? [...prev, id] : prev.filter(x => x !== id))
      } else {
        setJoined(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
      }
    } catch {
      setJoined(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }
  }

  return (
    <section className="container">
      <h2>Comunidades</h2>
      <p>Entre ou saia de comunidades (simulação via backend/local).</p>

      {loading ? <p>Carregando...</p> : (
        <div className="communities-grid">
          {comms.map(c => {
            const isJoined = joined.includes(c.id)
            return (
              <div className="community" key={c.id}>
                <h3>{c.name}</h3>
                <p>{c.members} membros</p>
                <button className="btn small" onClick={() => toggle(c.id)}>
                  {isJoined ? 'Sair' : 'Entrar'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}