    import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Auth from './Auth.jsx'

function Root() {
  const [userId, setUserId] = useState(() => {
    // ѕопытка восстановить сессии между перезагрузками (необ€зательно)
    return localStorage.getItem('tlern_user') || null
  })

  const handleLogin = (id) => {
    setUserId(id)
    try { localStorage.setItem('tlern_user', id) } catch {}
  }

  const handleLogout = () => {
    setUserId(null)
    try { localStorage.removeItem('tlern_user') } catch {}
  }

  // ѕо умолчанию показываем страницу авторизации.
  // ѕосле успешного входа (вызова onLogin) Ч показываем основное приложение.
  return userId ? <App userId={userId} onLogout={handleLogout} /> : <Auth onLogin={handleLogin} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
