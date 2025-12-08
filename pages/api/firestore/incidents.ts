import type { NextApiRequest, NextApiResponse } from 'next'

// Server-side Firestore incidents proxy for Control Center
// Auth: expects Authorization: Bearer <jwt> where payload contains {"role":"Admin"}

const initFirestore = () => {
  try {
    const admin = require('firebase-admin');
    if (!admin.apps || admin.apps.length === 0) {
      // Will pick default application credentials or configured env
      admin.initializeApp();
    }
    return admin.firestore();
  } catch (err) {
    console.warn('Firestore init error:', err?.message || err);
    return null;
  }
};

import { verifyShortToken } from '../../../lib/shortToken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = (req.headers['authorization'] || '') as string;
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const payload = verifyShortToken(token);
  const role = payload?.role;

  if (role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: admin role required' });
  }

  const db = initFirestore();
  if (!db) return res.status(503).json({ error: 'Firestore not configured' });

  try {
    const snap = await db.collection('alert_incidents').orderBy('lastSeenAt', 'desc').limit(50).get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ items });
  } catch (err: any) {
    console.error('Firestore read failed:', err);
    return res.status(500).json({ error: 'Failed to query incidents', details: err?.message });
  }
}
