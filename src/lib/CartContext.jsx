'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('domera_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [cartId, setCartId] = useState(() => {
    try {
      return localStorage.getItem('domera_cart_id') || (crypto.randomUUID ? crypto.randomUUID() : 'cart-' + Date.now());
    } catch {
      return 'cart-' + Date.now();
    }
  });

  useEffect(() => {
    localStorage.setItem('domera_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('domera_cart_id', cartId);
  }, [cartId]);

  const lineKey = (it) =>
    it.variantSKU || `${it.productId}|${it.size || ''}|${it.color || ''}|${it.fabric || ''}`;

  const add = (item) => {
    setItems((prev) => {
      const key = lineKey(item);
      const existing = prev.find((p) => lineKey(p) === key);
      if (existing) {
        return prev.map((p) => (p === existing ? { ...p, qty: p.qty + (item.qty || 1) } : p));
      }
      return [...prev, { ...item, qty: item.qty || 1, lineId: key }];
    });
    setIsOpen(true);
  };

  const remove = (lineId) => setItems((prev) => prev.filter((p) => p.lineId !== lineId));
  const updateQty = (lineId, qty) =>
    setItems((prev) => prev.map((p) => (p.lineId === lineId ? { ...p, qty: Math.max(1, qty) } : p)));
  const clear = () => {
    setItems([]);
    setCartId(crypto.randomUUID ? crypto.randomUUID() : 'cart-' + Date.now());
  };

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, add, remove, updateQty, clear, count, total, isOpen, cartId, open: () => setIsOpen(true), close: () => setIsOpen(false) }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};