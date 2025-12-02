import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

// Token swap: accept long-lived JWT (Bearer) and issue a short-lived session token
// Short token is HMAC-signed using NEXT_PUBLIC_SHORT_TOKEN_SECRET (set on server as SHORT_TOKEN_SECRET)

const SECRET = process.env.SHORT_TOKEN_SECRET || 'dev-short-secret-please-change';
const TTL_SEC = process.env.SHORT_TOKEN_TTL_SEC ? parseInt(process.env.SHORT_TOKEN_TTL_SEC) : 300; // 5 minutes

const parseRoleFromJwt = (token: string | undefined): any => {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload;
  } catch (err) {
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = (req.headers['authorization'] || '') as string;
  const longToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!longToken) return res.status(401).json({ error: 'Missing long-lived token' });

  const payload = parseRoleFromJwt(longToken);
  if (!payload || !payload.role) return res.status(401).json({ error: 'Invalid token payload' });

  // Basic expiry check if present
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    return res.status(401).json({ error: 'Long-lived token expired' });
  }

  // Issue short-lived token (signed by server secret)
  const shortPayload = {
    role: payload.role,
    sub: payload.sub || payload.user || 'local-dev',
    iat: Math.floor(Date.now() / 1000),
  };

  const shortToken = jwt.sign(shortPayload, SECRET, { algorithm: 'HS256', expiresIn: TTL_SEC });

  return res.status(200).json({ token: shortToken, expiresInSec: TTL_SEC });
}
