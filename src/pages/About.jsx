import React from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <section className="container">
      <h2>Sobre o OrkRetro</h2>
      <p>Projeto educacional em React que simula uma rede social retrô. Usa backend simples em /api (Express + arquivo db.json).</p>
      <p>Tecnologias: React + Vite + Fetch (JS) — código comentado em português.</p>
      <p><Link to="/">Voltar ao Feed</Link></p>
    </section>
  )
}