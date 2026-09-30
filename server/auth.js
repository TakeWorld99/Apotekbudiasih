import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function getJwtSecret() {
  if (process.env.APP_KEY) return process.env.APP_KEY.trim();
  const envPath = path.resolve(process.cwd(), '.env');
  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
  const match = envContent.match(/^APP_KEY=(.*)$/m);
  return match ? match[1].trim() : 'ApotekBudiAsihSecretKeyForProduction2026=';
}

const SECRET = getJwtSecret();

/**
 * Buat signed token aman untuk sesi pegawai
 */
export function createAuthToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    nik: user.nik,
    name: user.name,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 jam
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

/**
 * Validasi signed token
 */
export function verifyAuthToken(token) {
  if (!token) return null;
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  const parts = cleanToken.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (data.exp && Date.now() > data.exp) {
      return null; // Expired
    }
    return data;
  } catch (e) {
    return null;
  }
}
