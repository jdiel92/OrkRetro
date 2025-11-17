import React, { useEffect, useState } from 'react'
import API from '../api'
import CommunitiesPanel from '../components/CommunitiesPanel'

// Página inicial (feed) com visual "inspirado" no Orkut
export default function Feed() {
  const [posts, setPosts] = useState([])
  const [friends, setFriends] = useState([])
  const [comms, setComms] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCommunities, setShowCommunities] = useState(false)
  const [commQuery, setCommQuery] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [p, f, c] = await Promise.all([
          API.get('posts').catch(() => []),
          API.get('friends').catch(() => []),
          API.get('communities').catch(() => [])
        ])
        setPosts(Array.isArray(p) ? p : [])
        setFriends(Array.isArray(f) ? f : [])
        setComms(Array.isArray(c) ? c : [])
      } catch (e) {
        setPosts([]); setFriends([]); setComms([])
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handlePost(e) {
    e.preventDefault()
    if (!text.trim()) return
    try {
      const created = await API.post('posts', { text, avatar: 'https://picsum.photos/seed/me/80/80', user: 'Você' })
      setPosts(prev => [created, ...prev])
      setText('')
    } catch {
      const novo = { id: 'p' + Date.now(), user: 'Você', avatar: 'https://picsum.photos/seed/me/80/80', text, img: '', likes: 0, createdAt: new Date().toISOString() }
      setPosts(prev => [novo, ...prev])
      setText('')
    }
  }

  async function likePost(id) {
    try {
      const res = await API.post(`posts/${id}/like`)
      if (res && res.likes !== undefined) {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: res.likes } : p))
      }
    } catch {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p))
    }
  }

  const lower = commQuery.trim().toLowerCase()
  const previewComms = lower ? comms.filter(c => (c.name || '').toLowerCase().includes(lower)) : comms

  return (
    <div className="container layout" style={{ gap: 16 }}>
      {/* Coluna esquerda */}
      <aside className="sidebar" aria-label="Coluna lateral">
        <section className="mini-profile" style={{ marginBottom: 12 }}>
          <img className="avatar" src="https://picsum.photos/id/1005/120/120" alt="Avatar" />
          <h3>Você (treinee)</h3>
          <p style={{ margin: '6px 0', color: 'var(--muted)' }}>Desenvolvedor em aprendizado</p>
        </section>

        <section>
          <h4 style={{ margin: '8px 0' }}>Amigos</h4>
          <ul className="friend-list" id="friend-list">
            {friends.length === 0 && <li className="muted">Nenhum amigo</li>}
            {friends.map(f => (
              <li key={f.id}>
                <img src={f.avatar || `https://picsum.photos/seed/${f.id}/48/48`} alt={f.name} />
                <span>{f.name}</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      {/* Coluna central */}
      <main className="feed" aria-live="polite">
        <h2>Feed</h2>

        <form className="post-form" onSubmit={handlePost} style={{ marginBottom: 12 }}>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Escreva um recado..." rows="3" />
          <div className="form-actions">
            <button className="btn" type="submit">Publicar</button>
          </div>
        </form>

        <div className="posts-list" id="posts">
          {loading && <p>Carregando posts...</p>}
          {!loading && posts.length === 0 && <p className="muted">Nenhum post disponível.</p>}

          {posts.map(post => (
            <article className="post" key={post.id}>
              <div className="meta">
                <img src={post.avatar || `https://picsum.photos/seed/${post.user}/80/80`} alt={post.user} />
                <div>
                  <div className="who">{post.user}</div>
                  <div className="when">{post.createdAt ? new Date(post.createdAt).toLocaleString() : 'agora'}</div>
                </div>
              </div>

              <p>{post.text}</p>

              {post.img && <img className="post-media" src={post.img} alt="anexo" />}

              <div className="post-actions">
                <button className="btn" onClick={() => likePost(post.id)}>Curtir (<span className="like-count">{post.likes || 0}</span>)</button>
                <button className="btn ghost" onClick={() => alert('Comentário simulado (sem backend)')}>Comentar</button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Coluna direita */}
      <aside style={{ width: 260 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              type="search"
              placeholder="Pesquisar comunidades..."
              value={commQuery}
              onChange={e => setCommQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setShowCommunities(true) } }}
              style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid #e6d5c5' }}
            />
            {/* botão "Pesquisar" removido conforme solicitado */}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn small ghost" onClick={() => setCommQuery('')}>Limpar</button>
          </div>
        </div>

        <section className="community-list">
          <h4>Comunidades</h4>
          <div style={{ marginTop: 8 }}>
            {previewComms.length === 0 && <div className="muted">Nenhuma comunidade</div>}
            {previewComms.slice(0,4).map(c => (
              <div key={c.id} className="community" style={{ marginBottom: 8 }}>
                <strong>{c.name}</strong>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.members} membros</div>
              </div>
            ))}
            {previewComms.length > 4 && <div style={{ marginTop: 6 }}><small className="muted">{previewComms.length - 4} mais — abra o painel para ver todas</small></div>}
          </div>
        </section>

        <section style={{ marginTop: 12 }}>
          <h4>Recados</h4>
          <div className="post" style={{ padding: 8 }}>
            <p style={{ margin: 0, color: 'var(--muted)' }}>Caixa de recados (simulada). Use Mensagens para enviar textos.</p>
          </div>
        </section>
      </aside>

      {/* modal communities */}
      {showCommunities && <CommunitiesPanel initialQuery={commQuery} onClose={() => setShowCommunities(false)} />}
    </div>
  )
}