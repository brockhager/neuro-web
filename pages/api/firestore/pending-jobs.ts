import type { NextApiRequest, NextApiResponse } from 'next'

const initFirestore = () => {
  try {
    const admin = require('firebase-admin');
    if (!admin.apps || admin.apps.length === 0) admin.initializeApp();
    return admin.firestore();
  } catch (err) {
    console.warn('Firestore init error:', err?.message || err);
    return null;
  }
};

import jwt from 'jsonwebtoken';

const verifyShortToken = (token: string | undefined): any | null => {
  if (!token) return null;
  const SECRET = process.env.SHORT_TOKEN_SECRET || 'dev-short-secret-please-change';
  try { return jwt.verify(token, SECRET); } catch (err) { return null; }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = (req.headers['authorization'] || '') as string;
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const payload = verifyShortToken(token);
  const role = payload?.role;
  if (role !== 'User') return res.status(403).json({ error: 'Forbidden: User role required' });

  const db = initFirestore();
  if (!db) return res.status(503).json({ error: 'Firestore not configured' });

  try {
    const snap = await db.collection('pending_jobs_queue').orderBy('received_at', 'desc').limit(50).get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ items });
  } catch (err: any) {
    console.error('Failed to read pending_jobs_queue:', err?.message || err);
    return res.status(500).json({ error: 'Failed to query pending jobs', details: err?.message });
  }
}
