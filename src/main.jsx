import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import favicon from './assets/icon.svg' // или .png

function setFavicon(href) {
  let link = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = href
}

setFavicon(favicon)

createRoot(document.getElementById('root')).render(<App />)