import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="site-header">
      <div className="brand"><NavLink to="/">OrkRetro</NavLink></div>
      <nav className="main-nav">
        <NavLink to="/" end>Feed</NavLink>
        <NavLink to="/perfil">Perfil</NavLink>
        <NavLink to="/comunidades">Comunidades</NavLink>
        <NavLink to="/mensagens">Mensagens</NavLink>
        <NavLink to="/about">Sobre</NavLink>
      </nav>
    </header>
  )
}