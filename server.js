// Backend Express simples; serve API e (em produção) build estático
const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const DB_PATH = path.join(__dirname, 'db.json')
const PORT = process.env.PORT || 3000
const app = express()

app.use(cors())
app.use(express.json())

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8')
    const db = JSON.parse(raw)
    db.users = db.users || []
    db.sessions = db.sessions || []
    db.resetRequests = db.resetRequests || []
    return db
  } catch (e) {
    return { posts: [], friends: [], communities: [], messages: [], joined: [], users: [], sessions: [], resetRequests: [], profile: null }
  }
}
function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8')
}

/* POSTS */
app.get('/api/posts', (req, res) => {
  const db = readDB()
  res.json(db.posts || [])
})
app.post('/api/posts', (req, res) => {
  const db = readDB()
  const { user = 'Você', avatar = '', text = '', img = '' } = req.body
  if (!text) return res.status(400).json({ error: 'text required' })
  const novo = { id: 'p' + Date.now(), user, avatar, text, img, likes: 0, createdAt: new Date().toISOString() }
  db.posts = db.posts || []
  db.posts.unshift(novo)
  writeDB(db)
  res.status(201).json(novo)
})
app.post('/api/posts/:id/like', (req, res) => {
  const db = readDB()
  const post = (db.posts || []).find(p => p.id === req.params.id)
  if (!post) return res.status(404).json({ error: 'not found' })
  post.likes = (post.likes || 0) + 1
  writeDB(db)
  res.json({ id: post.id, likes: post.likes })
})

/* FRIENDS */
app.get('/api/friends', (req, res) => {
  const db = readDB()
  res.json(db.friends || [])
})
app.post('/api/friends', (req, res) => {
  const db = readDB()
  const { name = 'Amigo', avatar = '' } = req.body
  const novo = { id: 'f' + Date.now(), name, avatar }
  db.friends = db.friends || []
  db.friends.push(novo)
  writeDB(db)
  res.status(201).json(novo)
})
app.delete('/api/friends/:id', (req, res) => {
  const db = readDB()
  db.friends = (db.friends || []).filter(f => f.id !== req.params.id)
  writeDB(db)
  res.json({ ok: true })
})

/* COMMUNITIES */
app.get('/api/communities', (req, res) => {
  const db = readDB()
  res.json(db.communities || [])
})
app.post('/api/communities/:id/join', (req, res) => {
  const db = readDB()
  db.joined = db.joined || []
  const id = req.params.id
  if (db.joined.includes(id)) db.joined = db.joined.filter(x => x !== id)
  else db.joined.push(id)
  writeDB(db)
  res.json({ id, joined: db.joined.includes(id) })
})

/* MESSAGES */
app.get('/api/messages', (req, res) => {
  const db = readDB()
  res.json(db.messages || [])
})
app.post('/api/messages', (req, res) => {
  const db = readDB()
  const { to = '', text = '' } = req.body
  if (!to || !text) return res.status(400).json({ error: 'to and text required' })
  const novo = { id: 'm' + Date.now(), to, text, ts: Date.now() }
  db.messages = db.messages || []
  db.messages.unshift(novo)
  writeDB(db)
  res.status(201).json(novo)
})

/* -------------------------
   Profile endpoints (novo)
   ------------------------- */
// retorna perfil do usuário (se não existir, cria padrão)
app.get('/api/profile', (req, res) => {
  const db = readDB()
  if (!db.profile) {
    db.profile = {
      name: 'Você (treinee)',
      bio: 'Bio curta — desenvolvedor em aprendizado',
      gender: 'Não informado',
      avatar: 'https://picsum.photos/id/1005/120/120'
    }
    writeDB(db)
  }
  res.json(db.profile)
})

// atualiza perfil (name, bio, gender, avatar)
// aceita avatar como URL ou dataURL (base64)
app.post('/api/profile', (req, res) => {
  const db = readDB()
  const { name, bio, gender, avatar } = req.body
  db.profile = db.profile || {}
  if (name !== undefined) db.profile.name = String(name).slice(0, 100)
  if (bio !== undefined) db.profile.bio = String(bio).slice(0, 400)
  if (gender !== undefined) db.profile.gender = String(gender).slice(0, 50)
  if (avatar !== undefined) db.profile.avatar = String(avatar)
  writeDB(db)
  res.json(db.profile)
})

/* --- AUTH: register, login, recover, reset --- */
app.post('/api/auth/register', async (req, res) => {
  const db = readDB()
  const { name, email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  const exists = (db.users || []).find(u => u.email === email.toLowerCase())
  if (exists) return res.status(409).json({ error: 'user exists' })
  const hash = await bcrypt.hash(String(password), 10)
  const user = { id: 'u' + Date.now(), name: name || email.split('@')[0], email: email.toLowerCase(), passwordHash: hash, avatar: `https://picsum.photos/seed/${Date.now()}/120/120`, createdAt: new Date().toISOString() }
  db.users = db.users || []
  db.users.push(user)
  writeDB(db)
  const { passwordHash, ...safe } = user
  res.status(201).json({ user: safe })
})

app.post('/api/auth/login', async (req, res) => {
  const db = readDB()
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  const user = (db.users || []).find(u => u.email === email.toLowerCase())
  if (!user) return res.status(401).json({ error: 'invalid credentials' })
  const ok = await bcrypt.compare(String(password), user.passwordHash || '')
  if (!ok) return res.status(401).json({ error: 'invalid credentials' })
  const token = crypto.randomBytes(24).toString('hex')
  db.sessions = db.sessions || []
  db.sessions.push({ token, userId: user.id, createdAt: Date.now() })
  writeDB(db)
  const { passwordHash, ...safe } = user
  res.json({ token, user: safe })
})

app.post('/api/auth/recover', (req, res) => {
  const db = readDB()
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'email required' })
  const user = (db.users || []).find(u => u.email === email.toLowerCase())
  if (!user) return res.json({ ok: true }) // não vaza existência
  const token = crypto.randomBytes(20).toString('hex')
  db.resetRequests = db.resetRequests || []
  db.resetRequests.push({ token, userId: user.id, createdAt: Date.now() })
  writeDB(db)
  // Em produção: enviar email. Aqui retornamos token para fins de teste/dev.
  res.json({ ok: true, demoResetToken: token })
})

app.post('/api/auth/reset/:token', async (req, res) => {
  const db = readDB()
  const token = req.params.token
  const { password } = req.body
  if (!password) return res.status(400).json({ error: 'password required' })
  const reqItem = (db.resetRequests || []).find(r => r.token === token)
  if (!reqItem) return res.status(400).json({ error: 'invalid token' })
  const user = (db.users || []).find(u => u.id === reqItem.userId)
  if (!user) return res.status(400).json({ error: 'invalid token' })
  user.passwordHash = await bcrypt.hash(String(password), 10)
  db.resetRequests = (db.resetRequests || []).filter(r => r.token !== token)
  writeDB(db)
  res.json({ ok: true })
})

/* Serve frontend build in production (optional) */
const distPath = path.join(__dirname, 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`))