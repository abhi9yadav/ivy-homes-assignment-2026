// API client for solve.ivy.homes

// Use proxy in development, direct API in production
const BASE = import.meta.env.DEV 
  ? '/api' 
  : import.meta.env.VITE_API_BASE_URL || 'https://solve.ivy.homes'

function headers(token) {
  const h = {
    'Content-Type': 'application/json',
  }

  // Add API key header in production
  if (!import.meta.env.DEV && import.meta.env.VITE_API_KEY) {
    h['X-API-Key'] = import.meta.env.VITE_API_KEY
  }

  if (token) {
    h.Authorization = `Bearer ${token}`
  }

  return h
}

async function handleRes(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const detail = err.detail

    throw new Error(
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d.msg).join(', ')
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
    body: JSON.stringify({
      refresh_token: refreshTok,
    }),
  })

  return handleRes(res)
}

export async function getListings(
  token,
  {
    limit = 20,
    offset = 0,
    locality = '',
    bedroom = '',
  } = {}
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })

  if (locality) {
    params.set('locality', locality)
  }

  if (bedroom !== '') {
    params.set('bedroom', bedroom)
  }

  const res = await fetch(
    `${BASE}/v1/listings?${params.toString()}`,
    {
      headers: headers(token),
    }
  )

  return handleRes(res)
}

export async function getListing(token, listingId) {
  const res = await fetch(
    `${BASE}/v1/listings/${listingId}`,
    {
      headers: headers(token),
    }
  )

  return handleRes(res)
}

export async function getProjects(
  token,
  { limit = 20, offset = 0 } = {}
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })

  const res = await fetch(
    `${BASE}/v1/projects?${params.toString()}`,
    {
      headers: headers(token),
    }
  )

  return handleRes(res)
}

export async function getProject(token, projectId) {
  const res = await fetch(
    `${BASE}/v1/projects/${projectId}`,
    {
      headers: headers(token),
    }
  )

  return handleRes(res)
}

export async function getListingsByProject(
  token,
  projectId
) {
  const params = new URLSearchParams({
    limit: '50',
    offset: '0',
  })

  const res = await fetch(
    `${BASE}/v1/listings?${params.toString()}`,
    {
      headers: headers(token),
    }
  )

  const data = await handleRes(res)

  return {
    ...data,
    results: (data.results || []).filter(
      (listing) => listing.project_id === projectId
    ),
  }
}

export async function getLocalities(token) {
  const res = await fetch(`${BASE}/v1/localities`, {
    headers: headers(token),
  })

  return handleRes(res)
}

export async function getRentals(
  token,
  {
    limit = 20,
    offset = 0,
    locality = '',
    bedroom = '',
  } = {}
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })

  if (locality) {
    params.set('locality', locality)
  }

  if (bedroom !== '') {
    params.set('bedroom', bedroom)
  }

  const res = await fetch(
    `${BASE}/v1/rentals?${params.toString()}`,
    {
      headers: headers(token),
    }
  )

  return handleRes(res)
}

export async function getSimilarListings(
  token,
  listingId
) {
  const res = await fetch(
    `${BASE}/v1/listings/${listingId}/similar`,
    {
      headers: headers(token),
    }
  )

  return handleRes(res)
}

export async function getAnalyticsSummary(token) {
  const res = await fetch(
    `${BASE}/v1/analytics/summary`,
    {
      headers: headers(token),
    }
  )

  return handleRes(res)
}