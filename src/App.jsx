import { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Account from './pages/Account'
import Carrito from './pages/Carrito'
import Login from './pages/Login'

const SESSION_KEY = 'dayshop:session'

function readSession() {
  try {
    const stored = window.localStorage.getItem(SESSION_KEY)
    const session = stored ? JSON.parse(stored) : null

    return session &&
      typeof session.name === 'string' &&
      typeof session.email === 'string'
      ? session
      : null
  } catch {
    return null
  }
}

function RequireAuth({ customer, children }) {
  if (!customer) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  const [customer, setCustomer] = useState(readSession)
  const navigate = useNavigate()

  function handleLogin(user) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    setCustomer(user)
    navigate('/mi-cuenta', { replace: true })
  }

  function handleLogout() {
    window.localStorage.removeItem(SESSION_KEY)
    setCustomer(null)
    navigate('/login', { replace: true })
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={customer ? '/mi-cuenta' : '/login'} replace />
        }
      />
      <Route
        path="/login"
        element={
          customer ? (
            <Navigate to="/mi-cuenta" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/mi-cuenta"
        element={
          <RequireAuth customer={customer}>
            <Account customer={customer} onLogout={handleLogout} />
          </RequireAuth>
        }
      />
      <Route path="/carrito" element={<Carrito customer={customer} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
