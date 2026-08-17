'use client';
import { Outlet, NavLink, useNavigate } from '@/lib/router';
import { Box, Layers, FolderTree, Square, Package, ExternalLink, LogOut } from 'lucide-react';

const nav = [
  { to: '/admin/products', label: 'Товари', icon: Box },
  { to: '/admin/variants', label: 'Варіанти', icon: Layers },
  { to: '/admin/categories', label: 'Категорії', icon: FolderTree },
  { to: '/admin/fabrics', label: 'Тканини', icon: Square },
  { to: '/admin/bundles', label: 'Комплекти', icon: Package },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  async function logout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      navigate('/admin-login');
    }
  }

  return (
    <div className="min-h-screen bg-[#F4EFE7] flex">
      <aside className="w-64 bg-[#342112] text-[#FAF7F2] flex flex-col fixed h-screen">
        <div className="px-6 py-6 border-b border-[#FAF7F2]/10">
          <span className="font-heading text-2xl tracking-[0.22em] block">DOMERA</span>
          <span className="text-[9px] tracking-[0.32em] text-[#C6A17A] mt-1 block">ADMIN PANEL</span>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive ? 'bg-[#FAF7F2]/10 text-[#FAF7F2]' : 'text-[#FAF7F2]/65 hover:text-[#FAF7F2] hover:bg-[#FAF7F2]/5'
                }`
              }
            >
              <n.icon className="w-4 h-4" strokeWidth={1.4} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-[#FAF7F2]/10 space-y-1">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#FAF7F2]/65 hover:text-[#FAF7F2] transition-colors"
          >
            <ExternalLink className="w-4 h-4" strokeWidth={1.4} /> На сайт
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#FAF7F2]/65 hover:text-[#FAF7F2] transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.4} /> Вийти
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8 lg:p-10">
        {children || <Outlet />}
      </main>
    </div>
  );
}
