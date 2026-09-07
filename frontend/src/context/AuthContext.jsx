import { createContext, useContext, useEffect, useState } from "react"
import { api, setToken, getToken } from "../api/client"

const AuthContext = createContext(null)

const USER_KEY = "borrowhub_user"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    const raw = localStorage.getItem(USER_KEY)
    if (token && raw) {
      try {
        setUser(JSON.parse(raw))
      } catch {
        setToken(null)
        localStorage.removeItem(USER_KEY)
      }
    }
    setLoading(false)
  }, [])

  function persistSession({ token, user: nextUser }) {
    setToken(token)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
  }

  async function signup({ name, email, password }) {
    const data = await api.post("/auth/signup", { name, email, password })
    return persistSession(data)
  }

  async function login({ email, password }) {
    const data = await api.post("/auth/login", { email, password })
    return persistSession(data)
  }

  function logout() {
    setToken(null)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}