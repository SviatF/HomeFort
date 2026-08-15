'use client';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from '@/lib/router';
import { base44 } from '@/api/base44Client';
import { Loader2, Lock, ShieldAlert } from 'lucide-react';

export default function AdminRoute({ children }) {
  const [state, setState] = useState('loading');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    base44.auth
      .me()
      .then((u) => {
        if (!u) return setState('needLogin');
        if (u.role !== 'admin') return setState('denied');
        if (sessionStorage.getItem('admin_pin_ok') === '1') return setState('ok');
        setState('needPin');
      })
      .catch(() => setState('needLogin'));
  }, []);

  async function submitPin(e) {
    e.preventDefault();
    setVerifying(true);
    setError('');
    try {
      const res = await base44.functions.invoke('verifyAdminPin', { pin });
      if (res.data?.valid) {
        sessionStorage.setItem('admin_pin_ok', '1');
        setState('ok');
      } else {
        setError('Невірний PIN');
      }
    } catch {
      setError('Помилка перевірки. Спробуйте ще раз.');
    }
    setVerifying(false);
  }

  if (state === 'loading')
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <Loader2 className="w-8 h-8 animate-spin text-[#937C68]" />
      </div>
    );

  if (state === 'needLogin') return <Navigate to="/login" replace />;

  if (state === 'denied')
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-6">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-12 h-12 mx-auto text-[#8B3A2E] mb-4" strokeWidth={1.2} />
          <h1 className="font-heading text-3xl text-[#342112] mb-3">Доступ заборонено</h1>
          <p className="text-[#755A44] mb-6">Цей акаунт не має прав адміністратора. Увійдіть під адмін-акаунтом.</p>
          <button
            onClick={() => base44.auth.logout('/login')}
            className="px-6 py-3 bg-[#342112] text-[#FAF7F2] text-[12px] tracking-[0.22em] uppercase"
          >
            На сторінку входу
          </button>
        </div>
      </div>
    );

  if (state === 'needPin')
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-6">
        <form onSubmit={submitPin} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#342112] flex items-center justify-center mb-5">
              <Lock className="w-6 h-6 text-[#FAF7F2]" strokeWidth={1.4} />
            </div>
            <h1 className="font-heading text-3xl text-[#342112] mb-2">Адмін-панель DOMERA</h1>
            <p className="text-sm text-[#755A44]">Введіть другий фактор — PIN-код доступу</p>
          </div>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            autoFocus
            inputMode="numeric"
            className="w-full text-center tracking-[0.4em] bg-transparent border-b border-[#342112]/30 py-3 text-2xl text-[#342112] focus:border-[#342112] outline-none"
          />
          {error && <p className="text-sm text-[#8B3A2E] text-center mt-3">{error}</p>}
          <button
            type="submit"
            disabled={verifying || !pin}
            className="w-full mt-8 py-3.5 bg-[#342112] text-[#FAF7F2] text-[12px] tracking-[0.22em] uppercase disabled:opacity-50"
          >
            {verifying ? 'Перевірка…' : 'Увійти'}
          </button>
        </form>
      </div>
    );

  return children || <Outlet />;
}