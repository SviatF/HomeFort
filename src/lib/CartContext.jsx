'use client';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const CartContext = createContext(null);
const PURCHASE_INTENT_KEY = 'domera_purchase_intent_at';

function markPurchaseIntent() {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(PURCHASE_INTENT_KEY, String(Date.now())); } catch {}
  window.dispatchEvent(new CustomEvent('domera:purchase-intent', { detail: { at: Date.now() } }));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { const saved = localStorage.getItem('domera_cart'); return saved ? JSON.parse(saved) : []; }
    catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const undoTimer = useRef(null);
  const undoItem = useRef(null);
  const [cartId, setCartId] = useState(() => {
    try { return localStorage.getItem('domera_cart_id') || (crypto.randomUUID ? crypto.randomUUID() : 'cart-' + Date.now()); }
    catch { return 'cart-' + Date.now(); }
  });

  useEffect(() => { localStorage.setItem('domera_cart', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('domera_cart_id', cartId); }, [cartId]);
  useEffect(() => () => { clearTimeout(toastTimer.current); clearTimeout(undoTimer.current); }, []);

  const lineKey = (it) => it.variantSKU || `${it.productId}|${it.size || ''}|${it.color || ''}|${it.fabric || ''}`;
  const showToast = (next, timeout = 1200) => {
    clearTimeout(toastTimer.current);
    setToast(next);
    if (timeout) toastTimer.current = setTimeout(() => setToast(null), timeout);
  };

  const add = (item) => {
    const { suppressUpsell = false, ...cartItem } = item || {};
    setItems((prev) => {
      const key = lineKey(cartItem);
      const existing = prev.find((p) => lineKey(p) === key);
      if (existing) return prev.map((p) => (p === existing ? { ...p, qty: p.qty + (cartItem.qty || 1) } : p));
      return [...prev, { ...cartItem, qty: cartItem.qty || 1, lineId: key }];
    });
    markPurchaseIntent();
    showToast({ type: 'added', message: 'Додано в кошик' }, 1200);
    if (!suppressUpsell && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('domera:cart-add', { detail: { ...cartItem } }));
    }
  };

  const remove = (lineId) => {
    const removed = items.find((p) => p.lineId === lineId);
    if (!removed) return;
    undoItem.current = removed;
    setItems((prev) => prev.filter((p) => p.lineId !== lineId));
    clearTimeout(undoTimer.current);
    showToast({ type: 'removed', message: 'Товар видалено. Відновити' }, 5000);
    undoTimer.current = setTimeout(() => { undoItem.current = null; setToast(null); }, 5000);
  };

  const undoRemove = () => {
    if (!undoItem.current) return;
    const restored = undoItem.current;
    setItems((prev) => prev.some((p) => p.lineId === restored.lineId) ? prev : [...prev, restored]);
    undoItem.current = null;
    clearTimeout(undoTimer.current);
    setToast(null);
  };

  const updateQty = (lineId, qty) => setItems((prev) => prev.map((p) => (p.lineId === lineId ? { ...p, qty: Math.max(1, qty) } : p)));
  const clear = () => { setItems([]); setCartId(crypto.randomUUID ? crypto.randomUUID() : 'cart-' + Date.now()); };
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  return (
    <CartContext.Provider value={{
      items,
      add,
      remove,
      undoRemove,
      updateQty,
      clear,
      count,
      total,
      isOpen,
      cartId,
      markPurchaseIntent,
      open: () => { markPurchaseIntent(); setIsOpen(true); },
      close: () => setIsOpen(false),
    }}>
      {children}
      {toast && <div className="domera-toast" role="status" aria-live="polite"><span>{toast.message}</span>{toast.type === 'removed' && <button type="button" onClick={undoRemove}>Відновити</button>}</div>}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
