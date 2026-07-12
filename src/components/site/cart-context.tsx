"use client";

import * as React from "react";
import { toast } from "sonner";
import { CURRENCY } from "@/lib/constants";

export interface CartItem {
  id: string;
  menuItemId?: string;
  slug: string;
  name: string;
  size?: string;
  quantity: number;
  unitPriceCents: number;
  extras: { name: string; priceCents: number }[];
  notes?: string;
  imageUrl?: string | null;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  totalCents: number;
  itemCount: number;
}

const CartContext = React.createContext<CartContextValue | null>(null);

const STORAGE_KEY = "demos-cart-v1";

function makeId(item: { slug: string; size?: string; extras: { name: string }[] }): string {
  const extrasKey = item.extras.map((e) => e.name).sort().join("+");
  return `${item.slug}|${item.size || "std"}|${extrasKey}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const addItem = React.useCallback<CartContextValue["addItem"]>((item) => {
    const id = makeId(item);
    const quantity = item.quantity ?? 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: Math.min(50, i.quantity + quantity) } : i
        );
      }
      return [...prev, { ...item, id, quantity }];
    });
    toast.success(`${item.name} sepete eklendi`, {
      description: item.size
        ? `${item.size} · ${CURRENCY.formatShort(item.unitPriceCents * quantity)}`
        : CURRENCY.formatShort(item.unitPriceCents * quantity),
    });
  }, []);

  const removeItem = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = React.useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(50, quantity) } : i))
    );
  }, []);

  const clear = React.useCallback(() => setItems([]), []);
  const openCart = React.useCallback(() => setIsOpen(true), []);
  const closeCart = React.useCallback(() => setIsOpen(false), []);
  const toggleCart = React.useCallback(() => setIsOpen((v) => !v), []);

  const totalCents = React.useMemo(
    () =>
      items.reduce(
        (sum, i) =>
          sum +
          (i.unitPriceCents + i.extras.reduce((s, e) => s + e.priceCents, 0)) * i.quantity,
        0
      ),
    [items]
  );

  const itemCount = React.useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const value: CartContextValue = {
    items,
    isOpen,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    totalCents,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
