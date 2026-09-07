const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"

const TOKEN_KEY = "borrowhub_token"

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error("Can't reach the server. Is the backend running?")
  }

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    // GlobalExceptionHandler returns either {"message": "..."} (ApiException)
    // or a field->error map (validation failures) — handle both shapes.
    let message = "Something went wrong. Please try again."
    if (data) {
      if (typeof data === "string") message = data
      else if (data.message) message = data.message
      else {
        const firstError = Object.values(data)[0]
        if (firstError) message = firstError
      }
    }
    throw new Error(message)
  }

  return data
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
}