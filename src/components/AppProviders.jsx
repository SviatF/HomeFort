'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { CartProvider } from '@/lib/CartContext';
import { WishlistProvider } from '@/lib/WishlistContext';
import { CompareProvider } from '@/lib/CompareContext';
import { RecentlyViewedProvider } from '@/lib/RecentlyViewedContext';
import { AuthProvider } from '@/lib/AuthContext';
import CartDrawer from '@/components/domera/CartDrawer';
import ScrollProgress from '@/components/domera/ScrollProgress';
import CompareDrawer from '@/components/domera/CompareDrawer';
import { Toaster } from '@/components/ui/toaster';

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <RecentlyViewedProvider>
                <ScrollProgress />
                {children}
                <CartDrawer />
                <CompareDrawer />
                <Toaster />
              </RecentlyViewedProvider>
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
