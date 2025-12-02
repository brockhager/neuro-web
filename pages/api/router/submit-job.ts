import type { NextApiRequest, NextApiResponse } from 'next'

const ROUTER_API = process.env.ROUTER_API_URL || 'http://localhost:3000';

import jwt from 'jsonwebtoken';

const verifyShortToken = (token: string | undefined): any | null => {
  if (!token) return null;
  const SECRET = process.env.SHORT_TOKEN_SECRET || 'dev-short-secret-please-change';
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = (req.headers.authorization || '') as string;
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const payload = verifyShortToken(token);
  const role = payload?.role;
  if (role !== 'User') return res.status(403).json({ error: 'Forbidden: User role required' });

  const body = req.body || {};
  // Accept flexible fields, but forward to Router API as-is so backend enforces payment rules.
  try {
    const targetUrl = `${ROUTER_API}/api/v1/request/submit`;
    const r = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await r.text();
    const status = r.status;
    // Forward the response back (preserving status). If JSON, attempt parse
    try { return res.status(status).json(JSON.parse(text)); } catch (_e) { return res.status(status).send(text); }

  } catch (err: any) {
    console.error('Failed to forward job submission to Router API:', err?.message || err);
    return res.status(502).json({ error: 'Failed to forward to Router API', details: err?.message });
  }
}
