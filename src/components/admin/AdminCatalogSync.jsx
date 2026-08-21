'use client';

import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'domera_admin_product_overrides_v1';
const EXTRA_KEY = 'domera_admin_extra_products_v1';
const DELETED_KEY = 'domera_admin_deleted_products_v1';

function parse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function mutate(body) {
  const response = await fetch('/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export default function AdminCatalogSync() {
  const busy = useRef(false);
  const lastFingerprint = useRef('');

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      if (busy.current || cancelled) return;
      const overrides = parse(STORAGE_KEY, {});
      const extras = parse(EXTRA_KEY, []);
      const deleted = parse(DELETED_KEY, []);
      const fingerprint = JSON.stringify({ overrides, extras, deleted });
      if (fingerprint === lastFingerprint.current) return;
      lastFingerprint.current = fingerprint;

      const upserts = [
        ...Object.values(overrides || {}).filter(Boolean),
        ...(Array.isArray(extras) ? extras : []).filter(Boolean),
      ];
      const deletes = Array.isArray(deleted) ? deleted.filter(Boolean) : [];
      if (!upserts.length && !deletes.length) return;

      busy.current = true;
      try {
        for (const product of upserts) {
          await mutate({ action: 'upsert', product });
        }
        for (const slug of deletes) {
          await mutate({ action: 'delete', slug });
        }

        if (!cancelled) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(EXTRA_KEY);
          localStorage.removeItem(DELETED_KEY);
          lastFingerprint.current = JSON.stringify({ overrides: {}, extras: [], deleted: [] });
          window.dispatchEvent(new CustomEvent('domera:catalog-synced'));
        }
      } catch (error) {
        console.error('[admin-catalog-sync] sync failed', error);
      } finally {
        busy.current = false;
      }
    };

    sync();
    const timer = window.setInterval(sync, 1200);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
