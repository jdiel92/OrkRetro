import React from 'react'
import './App.css'

export default function App() {
  return (
    <div className="app-root">
      <header className="site-header">
        <div className="brand">
          <a href="/">OrkRetro</a>
        </div>
        <nav className="main-nav">
          <a href="/">Feed</a>
          <a href="/perfil">Perfil</a>
          <a href="/comunidades">Comunidades</a>
          <a href="/mensagens">Mensagens</a>
          <a href="/about">Sobre</a>
        </nav>
      </header>

      <main className="container">
        <h1>Bem-vindo ao OrkRetro</h1>
        <p>Projeto educacional — abra as rotas no navegador ou rode a app React completa.</p>
      </main>

      <footer className="site-footer">
        <p>OrkRetro — Demo educacional</p>
      </footer>
    </div>
  )
}
