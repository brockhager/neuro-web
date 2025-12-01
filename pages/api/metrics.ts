import type { NextApiRequest, NextApiResponse } from 'next'

// Secured proxy to Router API /metrics. Requires a server-side ADMIN_METRICS_SECRET
// and expects clients to send X-Admin-Metrics-Token header. This is a mock demo
// for RBAC; in production replace with session/JWT checks and an identity provider.

const TARGET = process.env.ROUTER_API_URL || 'http://localhost:3000'
const ADMIN_SECRET = process.env.ADMIN_METRICS_SECRET || 'ns-admin-ops-token-12345'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Server-side access control: require header 'x-admin-metrics-token' to match ADMIN_SECRET
  const token = req.headers['x-admin-metrics-token'] as string | undefined

  if (!token || token !== ADMIN_SECRET) {
    console.warn(`Unauthorized metrics request from ${req.socket.remoteAddress || 'unknown'}`)
    return res.status(401).json({ error: 'Unauthorized: missing or invalid admin metrics token' })
  }

  try {
    const url = new URL('/metrics', TARGET).toString()
    const fetchRes = await fetch(url, { method: 'GET' })

    const text = await fetchRes.text()

    // Forward the status and text
    const contentType = fetchRes.headers.get('content-type') || 'text/plain; charset=utf-8'
    res.setHeader('Content-Type', contentType)
    res.status(fetchRes.status).send(text)
  } catch (err: any) {
    console.error('metrics proxy error:', err?.message ?? err)
    res.status(502).json({ error: 'Failed to proxy metrics request', details: err?.message })
  }
}
