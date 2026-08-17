import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { scryptSync, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'domera_admin_session';
const DB_PATH = path.join(process.cwd(), 'data', 'admin-users.json');

async function readDb() {
  const raw = await readFile(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

export async function authenticateAdmin(email, password) {
  const db = await readDb();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = (db.users || []).find((item) => item.active !== false && String(item.email || '').toLowerCase() === normalizedEmail);
  if (!user?.password?.salt || !user?.password?.hash) return null;

  const expected = Buffer.from(user.password.hash, 'base64');
  const derived = scryptSync(String(password || ''), Buffer.from(user.password.salt, 'base64'), user.password.keyLength || expected.length);
  if (derived.length !== expected.length || !timingSafeEqual(derived, expected)) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export function encodeTemporarySession(email, password) {
  return Buffer.from(JSON.stringify({ e: email, p: password }), 'utf8').toString('base64url');
}

export function decodeTemporarySession(value) {
  try {
    const parsed = JSON.parse(Buffer.from(String(value || ''), 'base64url').toString('utf8'));
    if (!parsed?.e || !parsed?.p) return null;
    return { email: parsed.e, password: parsed.p };
  } catch {
    return null;
  }
}

export async function getAdminFromSession(value) {
  const credentials = decodeTemporarySession(value);
  if (!credentials) return null;
  return authenticateAdmin(credentials.email, credentials.password);
}
