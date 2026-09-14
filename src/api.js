// API client for solve.ivy.homes
const BASE = '/api'
const API_KEY = 'IVY26-C399C5E1186D'

function headers(token) {
  const h = { 'Content-Type': 'application/json', 'X-API-Key': API_KEY }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

async function handleRes(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const detail = err.detail
    throw new Error(
      typeof detail === 'string' ? detail
      : Array.isArray(detail)   ? detail.map(d => d.msg).join(', ')
      : 'Request failed'
    )
  }
  return res.json()
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password }),
  })
  return handleRes(res)
}

export async function refreshToken(refreshTok) {
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ refresh_token: refreshTok }),
  })
  return handleRes(res)
}

export async function getListings(token, {
  limit    = 20,
  offset   = 0,
  locality = '',
  bedroom  = '',
} = {}) {
  const params = new URLSearchParams({ limit, offset })
  if (locality) params.set('locality', locality)
  if (bedroom !== '') params.set('bedroom', bedroom)
  const res = await fetch(`${BASE}/v1/listings?${params}`, { headers: headers(token) })
  return handleRes(res)
}

export async function getListing(token, listingId) {
  const res = await fetch(`${BASE}/v1/listings/${listingId}`, { headers: headers(token) })
  return handleRes(res)
}

export async function getProjects(token, { limit = 20, offset = 0 } = {}) {
  const params = new URLSearchParams({ limit, offset })
  const res = await fetch(`${BASE}/v1/projects?${params}`, { headers: headers(token) })
  return handleRes(res)
}

export async function getProject(token, projectId) {
  const res = await fetch(`${BASE}/v1/projects/${projectId}`, { headers: headers(token) })
  return handleRes(res)
}

export async function getListingsByProject(token, projectId) {
  // Fetch up to 50 listings and filter by project_id client-side
  // (API doesn't support project_id filter directly)
  const params = new URLSearchParams({ limit: 50, offset: 0 })
  const res = await fetch(`${BASE}/v1/listings?${params}`, { headers: headers(token) })
  const data = await handleRes(res)
  return { ...data, results: (data.results || []).filter(l => l.project_id === projectId) }
}

export async function getLocalities(token) {
  const res = await fetch(`${BASE}/v1/localities`, { headers: headers(token) })
  return handleRes(res)
}

export async function getRentals(token, {
  limit    = 20,
  offset   = 0,
  locality = '',
  bedroom  = '',
} = {}) {
  const params = new URLSearchParams({ limit, offset })
  if (locality) params.set('locality', locality)
  if (bedroom !== '') params.set('bedroom', bedroom)
  const res = await fetch(`${BASE}/v1/rentals?${params}`, { headers: headers(token) })
  return handleRes(res)
}

export async function getSimilarListings(token, listingId) {
  const res = await fetch(`${BASE}/v1/listings/${listingId}/similar`, { headers: headers(token) })
  return handleRes(res)
}

export async function getAnalyticsSummary(token) {
  const res = await fetch(`${BASE}/v1/analytics/summary`, { headers: headers(token) })
  return handleRes(res)
}
