import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

let cache = null;

export function useSettings() {
  const [settings, setSettings] = useState(cache);
  useEffect(() => {
    if (cache) return;
    let active = true;
    base44.entities.Settings.list()
      .then((r) => {
        const s = (r || [])[0];
        if (s) {
          cache = s;
          if (active) setSettings(s);
          if (s.metaPixelId && typeof window !== 'undefined' && !window.__domeraPixelInit) {
            window.__domeraPixelInit = true;
            import('@/lib/analytics').then((m) => m.initMetaPixel(s.metaPixelId));
          }
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  return settings;
}