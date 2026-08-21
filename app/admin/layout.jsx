import AdminRoute from '@/components/admin/AdminRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminCatalogSync from '@/components/admin/AdminCatalogSync';

export const metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }) {
  return (
    <AdminRoute>
      <AdminCatalogSync />
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  );
}
