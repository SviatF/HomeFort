'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem('domera_compare') || '[]')); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('domera_compare', JSON.stringify(items)); } catch {}
  }, [items]);

  const has = (id) => items.some((x) => x.id === id);
  const toggle = (product) => setItems((prev) => {
    if (prev.some((x) => x.id === product.id)) return prev.filter((x) => x.id !== product.id);
    const next = [...prev, product];
    return next.slice(-3);
  });
  const clear = () => setItems([]);
  const value = useMemo(() => ({ items, count: items.length, has, toggle, clear, isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }), [items, isOpen]);
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
};