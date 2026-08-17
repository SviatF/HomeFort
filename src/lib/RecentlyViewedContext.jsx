'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const RecentlyViewedContext = createContext(null);

export function RecentlyViewedProvider({ children }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem('domera_recently_viewed') || '[]')); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('domera_recently_viewed', JSON.stringify(items)); } catch {}
  }, [items]);
  const add = (product) => {
    if (!product?.id) return;
    const entry = { id: product.id, slug: product.slug, name: product.name, price: product.price, oldPrice: product.oldPrice, images: product.images, image: product.images?.[0], category: product.category, salePercent: product.salePercent, availability: product.availability, rating: product.rating, reviewsCount: product.reviewsCount };
    setItems((prev) => [entry, ...prev.filter((x) => x.id !== entry.id)].slice(0, 8));
  };
  const value = useMemo(() => ({ items, add, clear: () => setItems([]) }), [items]);
  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export const useRecentlyViewed = () => {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  return ctx;
};