import AdminRoute from '@/components/admin/AdminRoute';
import AdminLayout from '@/components/admin/AdminLayout';
export const metadata = { robots: { index: false, follow: false } };
export default function Layout({ children }) { return <AdminRoute><AdminLayout>{children}</AdminLayout></AdminRoute>; }
