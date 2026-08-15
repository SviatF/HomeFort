import { Suspense } from 'react';
import PageContent from '@/screens/ResetPassword';

export const metadata = { robots: { index: false, follow: false }, alternates: { canonical: '/reset-password' } };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageContent />
    </Suspense>
  );
}
