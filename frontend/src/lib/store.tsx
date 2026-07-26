import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { CATALOG, type Product } from "./catalog";

export type CartItem = { productId: string; qty: number };

export type OrderStatus = "Order Received" | "Being Packed" | "Out for Delivery" | "Delivered" | "Cancelled";

export type User = { email: string; name: string; phone?: string; address?: string };

export type Order = {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: string;
  landmark: string;
  contact: string;
  zone: string;
  status: OrderStatus;
  note?: string;
  createdAt: number;
  statusHistory: { status: OrderStatus; at: number }[];
  issueReport?: { reason: string; at: number };
};

type StoreState = {
  user: User | null;
  setUser: (u: User | null) => void;
  zone: string | null;
  setZone: (z: string | null) => void;
  cart: CartItem[];
  addToCart: (productId: string, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  orders: Order[];
  placeOrder: (o: Omit<Order, "id" | "status" | "createdAt" | "statusHistory">) => Order;
  markDelivered: (orderId: string) => void;
  reportIssue: (orderId: string, reason: string) => void;
};

const StoreCtx = createContext<StoreState | null>(null);

const LS = {
  user: "md_user",
  zone: "md_zone",
  cart: "md_cart",
  orders: "md_orders",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUserState] = useState<User | null>(null);
  const [zone, setZoneState] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setUserState(read<User | null>(LS.user, null));
    setZoneState(read<string | null>(LS.zone, null));
    setCart(read<CartItem[]>(LS.cart, []));
    setOrders(read<Order[]>(LS.orders, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(LS.user, JSON.stringify(user));
  }, [user, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem(LS.zone, JSON.stringify(zone));
  }, [zone, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem(LS.cart, JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem(LS.orders, JSON.stringify(orders));
  }, [orders, hydrated]);

  // Simulate manual ops updates: progress in-progress orders every ~8s
  useEffect(() => {
    if (!hydrated) return;
    const t = setInterval(() => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.status === "Delivered" || o.status === "Cancelled") return o;
          const elapsed = Date.now() - o.createdAt;
          let next: OrderStatus = o.status;
          if (elapsed > 16000) next = "Out for Delivery";
          else if (elapsed > 8000) next = "Being Packed";
          if (next !== o.status) {
            return { ...o, status: next, statusHistory: [...o.statusHistory, { status: next, at: Date.now() }] };
          }
          return o;
        }),
      );
    }, 3000);
    return () => clearInterval(t);
  }, [hydrated]);

  const setZone = (z: string | null) => setZoneState(z);
  const setUser = (u: User | null) => setUserState(u);

  const addToCart = (productId: string, qty = 1) =>
    setCart((prev) => {
      const found = prev.find((i) => i.productId === productId);
      if (found) return prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { productId, qty }];
    });

  const updateQty = (productId: string, qty: number) =>
    setCart((prev) => (qty <= 0 ? prev.filter((i) => i.productId !== productId) : prev.map((i) => (i.productId === productId ? { ...i, qty } : i))));

  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((i) => i.productId !== productId));
  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => {
    const p = CATALOG.find((c) => c.id === i.productId);
    return s + (p ? p.price * i.qty : 0);
  }, 0);

  const placeOrder: StoreState["placeOrder"] = (o) => {
    const now = Date.now();
    const order: Order = {
      ...o,
      id: "MD" + now.toString().slice(-8),
      status: "Order Received",
      createdAt: now,
      statusHistory: [{ status: "Order Received", at: now }],
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    return order;
  };

  const markDelivered: StoreState["markDelivered"] = (orderId) =>
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId && o.status !== "Delivered" && o.status !== "Cancelled"
          ? { ...o, status: "Delivered", statusHistory: [...o.statusHistory, { status: "Delivered", at: Date.now() }] }
          : o,
      ),
    );

  const reportIssue: StoreState["reportIssue"] = (orderId, reason) =>
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, issueReport: { reason, at: Date.now() } } : o)),
    );

  return (
    <StoreCtx.Provider
      value={{ user, setUser, zone, setZone, cart, addToCart, updateQty, removeFromCart, clearCart, cartCount, cartSubtotal, orders, placeOrder, markDelivered, reportIssue }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function getProduct(id: string): Product | undefined {
  return CATALOG.find((p) => p.id === id);
}