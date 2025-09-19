// utils/api.js
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('authToken')

  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}` // ✅ แนบโทเคน
  }

  const res = await fetch(`http://localhost:3000${url}`, {
    ...options,
    headers
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return res.json()
}
