'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { CartProvider } from '@/lib/CartContext';
import { WishlistProvider } from '@/lib/WishlistContext';
import { AuthProvider } from '@/lib/AuthContext';
import CartDrawer from '@/components/domera/CartDrawer';
import ScrollProgress from '@/components/domera/ScrollProgress';
import { Toaster } from '@/components/ui/toaster';

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <CartProvider>
          <WishlistProvider>
            <ScrollProgress />
            {children}
            <CartDrawer />
            <Toaster />
          </WishlistProvider>
        </CartProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
