import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext(null)

const USERS_KEY = "borrowhub_users"
const SESSION_KEY = "borrowhub_session"

// --- tiny localStorage "database" -------------------------------------
// Swap these three helpers for real API calls later (e.g. fetch("/api/..."))
// and nothing in the pages/components that consume useAuth() has to change.

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Not real security — this is only here so the demo doesn't store raw
// passwords. Replace with proper hashing (bcrypt/argon2) on a real backend.
async function hash(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      try {
        setUser(JSON.parse(raw))
      } catch {
        localStorage.removeItem(SESSION_KEY)
      }
    }
    setLoading(false)
  }, [])

  async function signup({ name, email, password }) {
    const users = readUsers()
    const normalizedEmail = email.trim().toLowerCase()

    if (users.some((u) => u.email === normalizedEmail)) {
      throw new Error("An account with that email already exists.")
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hash(password),
      createdAt: new Date().toISOString(),
    }

    writeUsers([...users, newUser])

    const session = { id: newUser.id, name: newUser.name, email: newUser.email }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }

  async function login({ email, password }) {
    const users = readUsers()
    const normalizedEmail = email.trim().toLowerCase()
    const passwordHash = await hash(password)

    const found = users.find(
      (u) => u.email === normalizedEmail && u.passwordHash === passwordHash
    )

    if (!found) {
      throw new Error("Invalid email or password.")
    }

    const session = { id: found.id, name: found.name, email: found.email }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
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
