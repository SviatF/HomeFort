'use client';

import { useState } from 'react';
import { Loader2, LockKeyhole } from 'lucide-react';

function safeReturnTo(value) {
  if (!value || typeof value !== 'string') return '/admin';
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/admin';
  return value;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Не вдалося увійти.');
      const params = new URLSearchParams(window.location.search);
      window.location.href = safeReturnTo(params.get('returnTo'));
    } catch (err) {
      setError(err?.message || 'Не вдалося увійти.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4EFE7] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-[#FAF7F2] border border-[#342112]/10 px-8 py-10 shadow-[0_20px_60px_rgba(52,33,18,0.08)]">
        <div className="w-12 h-12 bg-[#342112] text-[#FAF7F2] flex items-center justify-center mb-7">
          <LockKeyhole className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <div className="mb-8">
          <div className="text-[10px] tracking-[0.28em] uppercase text-[#937C68] mb-2">DOMERA / Secure access</div>
          <h1 className="font-heading text-4xl text-[#342112]">Admin Login</h1>
          <p className="text-sm text-[#755A44] mt-2">Вхід у власну адмін-систему DOMERA.</p>
        </div>

        {error && <div className="mb-5 border border-[#8B3A2E]/20 bg-[#8B3A2E]/5 px-4 py-3 text-sm text-[#8B3A2E]">{error}</div>}

        <form onSubmit={submit} className="space-y-5">
          <label className="block">
            <span className="block text-[10px] tracking-[0.18em] uppercase text-[#937C68] mb-2">Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#342112]/15 px-4 py-3.5 text-sm text-[#342112] outline-none focus:border-[#342112]"
              placeholder="admin@domera.shop"
              required
              autoFocus
            />
          </label>

          <label className="block">
            <span className="block text-[10px] tracking-[0.18em] uppercase text-[#937C68] mb-2">Пароль</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#342112]/15 px-4 py-3.5 text-sm text-[#342112] outline-none focus:border-[#342112]"
              placeholder="••••••••••••••••"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#342112] text-[#FAF7F2] py-4 text-[11px] tracking-[0.22em] uppercase flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Вхід…' : 'Увійти в адмінку'}
          </button>
        </form>

        <p className="text-[11px] leading-relaxed text-[#937C68] mt-6">
          Тимчасовий файловий режим: обліковий запис зберігається в GitHub лише як scrypt hash. Сесія — Secure HttpOnly cookie на 12 годин; після підключення постійної БД її буде замінено на серверну session storage.
        </p>
      </div>
    </main>
  );
}
