import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { login as apiLogin } from './api.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'ivy_access_token'
const REFRESH_KEY = 'ivy_refresh_token'
const USER_KEY = 'ivy_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || null)
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(USER_KEY)) } catch { return null }
  })

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password)
    setToken(data.access_token)
    setUser(data.user)
    sessionStorage.setItem(TOKEN_KEY, data.access_token)
    sessionStorage.setItem(REFRESH_KEY, data.refresh_token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user))
    return data
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_KEY)
    sessionStorage.removeItem(USER_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
