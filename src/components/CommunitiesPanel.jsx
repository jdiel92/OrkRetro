import React, { useEffect, useState } from 'react'
import API from '../api'

// Painel modal de comunidades (lista, pesquisar e entrar/sair)
export default function CommunitiesPanel({ onClose, initialQuery = '' }) {
  const [comms, setComms] = useState([])
  const [joined, setJoined] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => { setQuery(initialQuery || '') }, [initialQuery])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const [c, dbJoined] = await Promise.all([
          API.get('communities').catch(() => []),
          API.get('joined').catch(() => null)
        ])
        if (!mounted) return
        setComms(Array.isArray(c) ? c : [])
        setJoined(Array.isArray(dbJoined) ? dbJoined : [])
      } catch {
        if (!mounted) return
        setComms([]); setJoined([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  async function toggleJoin(id) {
    setBusyId(id)
    try {
      const res = await API.post(`communities/${id}/join`)
      if (res && res.joined !== undefined) {
        setJoined(prev => res.joined ? [...prev, id] : prev.filter(x => x !== id))
      } else {
        setJoined(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
      }
    } catch {
      setJoined(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    } finally {
      setBusyId(null)
    }
  }

  const lower = query.trim().toLowerCase()
  const filtered = lower ? comms.filter(c => (c.name || '').toLowerCase().includes(lower)) : comms

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />

      <div className="community-modal" role="dialog" aria-modal="true" aria-label="Comunidades">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <strong>Comunidades</strong>
          <button className="btn small" onClick={onClose}>Fechar</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="search"
            aria-label="Pesquisar comunidades"
            placeholder="Pesquisar comunidades..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid #e6d5c5' }}
          />
          <button className="btn small ghost" onClick={() => setQuery('')}>Limpar</button>
        </div>

        {loading && <p>Carregando comunidades...</p>}
        {!loading && filtered.length === 0 && <p className="muted">Nenhuma comunidade encontrada.</p>}

        {!loading && filtered.map(c => {
          const isJoined = joined.includes(c.id)
          return (
            <div key={c.id} className="community" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.members} membros</div>
              </div>
              <div>
                <button
                  className={`btn small ${isJoined ? 'ghost' : ''}`}
                  onClick={() => toggleJoin(c.id)}
                  disabled={busyId === c.id}
                >
                  {busyId === c.id ? '...' : (isJoined ? 'Sair' : 'Entrar')}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}