import crypto from 'crypto'

const base64urlDecode = (input: string) => {
  // from base64url -> base64
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  const padded = padding ? base64 + '='.repeat(4 - padding) : base64;
  return Buffer.from(padded, 'base64').toString('utf8');
}

const base64url = (input: string | Buffer) => {
  const str = typeof input === 'string' ? Buffer.from(input, 'utf8').toString('base64') : Buffer.from(input).toString('base64');
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export const verifyShortToken = (token: string | undefined): any | null => {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, encodedSig] = parts;
    const SECRET = process.env.SHORT_TOKEN_SECRET || 'dev-short-secret-please-change';
    const unsigned = `${encodedHeader}.${encodedPayload}`;
    const expectedSigBuf = crypto.createHmac('sha256', SECRET).update(unsigned).digest();
    const expectedSig = base64url(expectedSigBuf);

    // quick length check — avoid calling timingSafeEqual on unequal buffers
    const a = Buffer.from(expectedSig);
    const b = Buffer.from(encodedSig);
    if (a.length !== b.length) return null;
    if (!crypto.timingSafeEqual(a, b)) return null;

    const payloadJson = base64urlDecode(encodedPayload);
    const payload = JSON.parse(payloadJson);
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

export default verifyShortToken;
