import { cookies } from 'next/headers';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { ADMIN_SESSION_COOKIE, getAdminFromSession } from '@/lib/localAdminDb';

const CATALOG_PATH = path.join(process.cwd(), 'public', 'data', 'homefort-beds.json');
const GITHUB_API = 'https://api.github.com';

async function requireAdmin() {
  const store = await cookies();
  const value = store.get(ADMIN_SESSION_COOKIE)?.value;
  return getAdminFromSession(value);
}

async function readLocalCatalog() {
  const raw = await readFile(CATALOG_PATH, 'utf8');
  return JSON.parse(raw);
}

function applyMutation(payload, body) {
  const products = Array.isArray(payload?.products) ? [...payload.products] : [];
  const action = body?.action || 'upsert';
  const product = body?.product || null;
  const slug = String(body?.slug || product?.slug || '').trim();
  if (!slug) throw new Error('slug is required');

  if (action === 'delete') {
    const next = products.filter((item) => item?.slug !== slug);
    return { ...payload, count: next.length, updatedAt: new Date().toISOString(), products: next };
  }

  if (!product || typeof product !== 'object') throw new Error('product is required');
  const clean = { ...product, slug };
  delete clean.id;
  delete clean.source;

  const index = products.findIndex((item) => item?.slug === slug);
  if (index >= 0) products[index] = { ...products[index], ...clean };
  else products.push(clean);

  return { ...payload, count: products.length, updatedAt: new Date().toISOString(), products };
}

async function syncGithub(payload, message) {
  const token = process.env.GITHUB_ADMIN_TOKEN;
  if (!token) return { ok: false, skipped: true, reason: 'GITHUB_ADMIN_TOKEN is not configured' };

  const repo = process.env.GITHUB_CATALOG_REPO || 'SviatF/HomeFort';
  const branch = process.env.GITHUB_CATALOG_BRANCH || 'main';
  const filePath = 'public/data/homefort-beds.json';
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  const currentRes = await fetch(`${GITHUB_API}/repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(branch)}`, { headers, cache: 'no-store' });
  if (!currentRes.ok) throw new Error(`GitHub read failed: ${currentRes.status}`);
  const current = await currentRes.json();

  const updateRes = await fetch(`${GITHUB_API}/repos/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message,
      branch,
      sha: current.sha,
      content: Buffer.from(`${JSON.stringify(payload, null, 2)}\n`, 'utf8').toString('base64'),
    }),
  });
  if (!updateRes.ok) {
    const text = await updateRes.text();
    throw new Error(`GitHub write failed: ${updateRes.status} ${text.slice(0, 180)}`);
  }
  const result = await updateRes.json();
  return { ok: true, commit: result?.commit?.sha || null };
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return Response.json(await readLocalCatalog(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error?.message || 'Catalog read failed' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const current = await readLocalCatalog();
    const next = applyMutation(current, body);
    const slug = String(body?.slug || body?.product?.slug || '').trim();

    let local = { ok: false };
    try {
      await writeFile(CATALOG_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
      local = { ok: true };
    } catch (error) {
      local = { ok: false, reason: error?.message || 'Local filesystem is read-only' };
    }

    let github;
    try {
      github = await syncGithub(next, `admin: ${body?.action === 'delete' ? 'delete' : 'update'} product ${slug}`);
    } catch (error) {
      github = { ok: false, reason: error?.message || 'GitHub sync failed' };
    }

    revalidatePath('/');
    revalidatePath('/catalog/beds');
    if (slug) revalidatePath(`/product/${slug}`);

    if (!local.ok && !github.ok) {
      return Response.json({ error: 'Catalog was not persisted', local, github }, { status: 500 });
    }

    return Response.json({ ok: true, local, github, productCount: next.products?.length || 0 });
  } catch (error) {
    return Response.json({ error: error?.message || 'Catalog update failed' }, { status: 400 });
  }
}
