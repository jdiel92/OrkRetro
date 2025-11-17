import React, { useEffect, useState } from 'react'
import API from '../api'

// Página de perfil com edição (nome, bio, sexo, foto) — botão de editar garantido visível
export default function Profile() {
  const [profile, setProfile] = useState({
    name: 'Você (treinee)',
    bio: 'Bio curta — desenvolvedor em aprendizado',
    gender: 'Não informado',
    avatar: 'https://picsum.photos/id/1005/120/120'
  })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', bio: '', gender: 'Não informado', avatar: '' })

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      try {
        const p = await API.get('profile')
        if (p) {
          setProfile(p)
          setForm({
            name: p.name || '',
            bio: p.bio || '',
            gender: p.gender || 'Não informado',
            avatar: p.avatar || ''
          })
        } else {
          // fallback mantém profile inicial
          setForm({
            name: profile.name,
            bio: profile.bio,
            gender: profile.gender,
            avatar: profile.avatar
          })
        }
      } catch (err) {
        // log para debug
        // eslint-disable-next-line no-console
        console.warn('Falha ao carregar /api/profile, usando fallback local', err)
        setForm({
          name: profile.name,
          bio: profile.bio,
          gender: profile.gender,
          avatar: profile.avatar
        })
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFile(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setForm(prev => ({ ...prev, avatar: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function saveProfile(e) {
    e && e.preventDefault()
    setSaving(true)
    try {
      const updated = await API.post('profile', form)
      if (updated) {
        setProfile(updated)
        setForm({
          name: updated.name || '',
          bio: updated.bio || '',
          gender: updated.gender || 'Não informado',
          avatar: updated.avatar || ''
        })
        setEditing(false)
      }
    } catch (err) {
      // fallback local update
      // eslint-disable-next-line no-console
      console.warn('Falha ao salvar profile (API), atualizando localmente', err)
      setProfile(prev => ({ ...prev, ...form }))
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  // Sempre mostrar botão de editar (não depende de loading)
  return (
    <section className="profile-page container">
      <section className="profile-header" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <img className="avatar-large" src={form.avatar || profile.avatar} alt={profile.name} />
          <div>
            <h1>{profile.name}</h1>
            <p style={{ color: 'var(--muted)' }}>{profile.bio}</p>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sexo: {profile.gender}</p>
            <div style={{ marginTop: 8 }}>
              <button className="btn" onClick={() => setEditing(true)}>Editar perfil</button>
            </div>
          </div>
        </div>
      </section>

      {editing && (
        <form onSubmit={saveProfile} className="post-form" style={{ marginTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Nome
            <input name="name" value={form.name} onChange={handleChange} />
          </label>

          <label style={{ display: 'block', marginBottom: 8 }}>
            Bio
            <textarea name="bio" rows="3" value={form.bio} onChange={handleChange} />
          </label>

          <label style={{ display: 'block', marginBottom: 8 }}>
            Sexo
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option>Não informado</option>
              <option>Feminino</option>
              <option>Masculino</option>
              <option>Outro</option>
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: 8 }}>
            Foto de perfil (arquivo)
            <input type="file" accept="image/*" onChange={handleFile} />
          </label>

          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button className="btn" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" className="btn ghost" onClick={() => {
              setEditing(false)
              setForm({
                name: profile.name,
                bio: profile.bio,
                gender: profile.gender,
                avatar: profile.avatar
              })
            }}>Cancelar</button>
          </div>
        </form>
      )}

      <section style={{ marginTop: 24 }}>
        <h2>Suas publicações</h2>
        <div id="profile-posts" className="posts-list" style={{ marginTop: 8 }}>
          <p className="muted">Use o Feed para criar publicações — seus posts aparecerão aqui.</p>
        </div>
      </section>
    </section>
  )
}