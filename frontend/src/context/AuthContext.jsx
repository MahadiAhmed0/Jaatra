import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('jaatra_token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!token)

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    api
      .getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('jaatra_token')
        setToken('')
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = (newToken) => {
    localStorage.setItem('jaatra_token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('jaatra_token')
    setToken('')
    setUser(null)
  }

  const refreshUser = () => api.getMe().then((res) => setUser(res.data))

  return (
    <AuthContext.Provider
      value={{ token, user, loading, isAdmin: user?.role === 'admin', login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
