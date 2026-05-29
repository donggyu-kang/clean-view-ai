const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

function getToken() {
  try {
    const stored = localStorage.getItem('auth')
    return stored ? JSON.parse(stored).token : null
  } catch { return null }
}

async function req(path, options = {}) {
  const token = getToken()
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const getSessions    = ()                   => req('/api/v1/sessions')
export const getMessages    = (sid)                => req(`/api/v1/sessions/${sid}/messages`)
export const deleteSession  = (sid)                => req(`/api/v1/sessions/${sid}`, { method: 'DELETE' })
export const sendMessage    = (message, sessionId) => req('/api/v1/chat/message', {
  method: 'POST',
  body: JSON.stringify({ message, sessionId: sessionId?.toString() ?? null }),
})
export const blockSession   = (currentId, blockedId) => req(`/api/v1/sessions/${currentId}/blocks`, {
  method: 'POST',
  body: JSON.stringify({ blockedSessionId: blockedId }),
})
export const unblockSession = (currentId, blockedId) =>
  req(`/api/v1/sessions/${currentId}/blocks/${blockedId}`, { method: 'DELETE' })
