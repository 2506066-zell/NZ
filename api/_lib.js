import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: true }
});
export function readBody(req) {
  return new Promise(resolve => {
    let data = '';
    req.on('data', c => { data += c; });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
    });
  });
}
export function verifyToken(req, res) {
  const auth = req.headers.authorization || '';
  const [type, token] = auth.split(' ');
  if (type !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  try {
    const opts = { audience: 'cute-futura', issuer: 'cute-futura' };
    return jwt.verify(token, process.env.JWT_SECRET, opts);
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
}
