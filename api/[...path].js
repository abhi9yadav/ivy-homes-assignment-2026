export default async function handler(req, res) {
  try {
    const apiKey = process.env.IVY_API_KEY

    if (!apiKey) {
      return res.status(500).json({
        error: 'IVY_API_KEY is not configured',
      })
    }

    const url = new URL(req.url, `http://${req.headers.host}`)

    // Remove /api from the request path
    const targetPath = url.pathname.replace(/^\/api/, '')

    const targetUrl =
      `https://solve.ivy.homes${targetPath}${url.search}`

    const headers = {
      'X-API-Key': apiKey,
    }

    // Forward Authorization header
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization
    }

    // Forward content type
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type']
    }

    const options = {
      method: req.method,
      headers,
    }

    // Forward request body for POST/PUT/PATCH
    if (!['GET', 'HEAD'].includes(req.method)) {
      options.body = JSON.stringify(req.body)
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(targetUrl, options)

    const contentType = response.headers.get('content-type')

    if (contentType) {
      res.setHeader('Content-Type', contentType)
    }

    const data = await response.text()

    return res.status(response.status).send(data)
  } catch (error) {
    console.error('API proxy error:', error)

    return res.status(500).json({
      error: 'Internal server error',
    })
  }
}
