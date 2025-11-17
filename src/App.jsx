import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import Communities from './pages/Communities'
import Messages from './pages/Messages'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Recover from './pages/Recover'
import './index.css'

// Componente principal: define rotas e layout básico
export default function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="container layout">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recover" element={<Recover />} />
          <Route path="/" element={<Feed />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/comunidades" element={<Communities />} />
          <Route path="/mensagens" element={<Messages />} />
          <Route path="/about" element={<About />} />
          {/* rota fallback */}
          <Route path="*" element={<div style={{padding:20}}>Página não encontrada — <a href="/">Voltar</a></div>} />
        </Routes>
      </main>
    </div>
  )
}