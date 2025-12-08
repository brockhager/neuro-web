import type { NextApiRequest, NextApiResponse } from 'next'
// Small server-only JWT signing fallback (HMAC-SHA256) so the API works without the
// external `jsonwebtoken` package during local/dev runs. This file runs on the
// server (Next.js API route) so using Node's crypto is safe.
import crypto from 'crypto'

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

  // Issue short-lived token (signed by server secret). We implement a tiny
  // JWT signer here so the API doesn't depend on the `jsonwebtoken` package.
  const shortPayload = {
    role: payload.role,
    sub: payload.sub || payload.user || 'local-dev',
    iat: Math.floor(Date.now() / 1000),
  };

  // Create a minimal JWT: base64url(header).base64url(payload).base64url(HMAC_SHA256)
  const base64url = (input: string | Buffer) => {
    const str = typeof input === 'string' ? Buffer.from(input, 'utf8').toString('base64') : Buffer.from(input).toString('base64');
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  };

  const signHMAC = (msg: string, secret: string) => {
    return crypto.createHmac('sha256', secret).update(msg).digest();
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payloadWithExpiry = { ...shortPayload, iat: now, exp: now + TTL_SEC };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payloadWithExpiry));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = base64url(signHMAC(unsignedToken, SECRET));
  const shortToken = `${unsignedToken}.${signature}`;

  return res.status(200).json({ token: shortToken, expiresInSec: TTL_SEC });
}
