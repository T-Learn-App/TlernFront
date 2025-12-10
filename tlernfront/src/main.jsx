import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Auth from './Auth.jsx'
import { clearAuth, getStoredAuth } from './services/auth'

function Root() {
  const [auth, setAuth] = useState(() => getStoredAuth())

  const handleAuth = (authData) => {
    setAuth(authData)
  }

  const handleLogout = () => {
    clearAuth()
    setAuth(null)
  }

  return auth ? <App auth={auth} onLogout={handleLogout} /> : <Auth onAuth={handleAuth} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
