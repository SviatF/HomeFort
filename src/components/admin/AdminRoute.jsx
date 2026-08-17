'use client';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from '@/lib/router';
import { Loader2 } from 'lucide-react';

export default function AdminRoute({ children }) {
  const [state, setState] = useState('loading');
  const [returnTo, setReturnTo] = useState('/admin');

  useEffect(() => {
    let active = true;
    if (typeof window !== 'undefined') {
      setReturnTo(window.location.pathname + window.location.search);
    }

    fetch('/api/admin/session', { cache: 'no-store', credentials: 'same-origin' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        if (response.ok && data?.ok && data?.user) setState('ok');
        else setState('needLogin');
      })
      .catch(() => {
        if (active) setState('needLogin');
      });

    return () => { active = false; };
  }, []);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <Loader2 className="w-8 h-8 animate-spin text-[#937C68]" />
      </div>
    );
  }

  if (state === 'needLogin') {
    return <Navigate to={`/admin-login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return children || <Outlet />;
}
