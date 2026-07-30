import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  INVENTORY_EVENT,
  SHOP_SESSION_KEY,
  DEMO_SHOP,
  GST_RATE,
  consumeStock,
  demoBills,
  demoInventory,
  readBills,
  readInventory,
  readShop,
  writeInventory,
  writeShop,
  type Bill,
  type InventoryItem,
  type ShopAccount,
} from "./shop";

type ShopState = {
  hydrated: boolean;
  shop: ShopAccount | null;
  signedIn: boolean;
  demo: boolean;
  startDemo: () => void;
  exitDemo: () => void;
  register: (account: Omit<ShopAccount, "createdAt">) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  inventory: InventoryItem[];
  upsertItem: (item: InventoryItem) => void;
  removeItem: (id: string) => void;
  bills: Bill[];
  sell: (
    lines: { productId?: string; name: string; pack: string; qty: number; price: number }[],
    meta: { customerName: string; customerPhone: string },
  ) => Bill;
};

const Ctx = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [shop, setShop] = useState<ShopAccount | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [demo, setDemo] = useState(false);
  const demoRef = useRef(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);

  const refresh = useCallback(() => {
    if (demoRef.current) return;
    setInventory(readInventory());
    setBills(readBills());
  }, []);

  useEffect(() => {
    setShop(readShop());
    setSignedIn(window.localStorage.getItem(SHOP_SESSION_KEY) === "1");
    refresh();
    setHydrated(true);
    const onChange = () => refresh();
    window.addEventListener(INVENTORY_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(INVENTORY_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  const register: ShopState["register"] = (account) => {
    const full: ShopAccount = { ...account, createdAt: Date.now() };
    writeShop(full);
    setShop(full);
    window.localStorage.setItem(SHOP_SESSION_KEY, "1");
    setSignedIn(true);
    refresh();
  };

  const login: ShopState["login"] = (email, password) => {
    const acc = readShop();
    if (!acc || acc.email.toLowerCase() !== email.trim().toLowerCase() || acc.password !== password) return false;
    setShop(acc);
    window.localStorage.setItem(SHOP_SESSION_KEY, "1");
    setSignedIn(true);
    refresh();
    return true;
  };

  const logout = () => {
    window.localStorage.removeItem(SHOP_SESSION_KEY);
    setSignedIn(false);
    demoRef.current = false;
    setDemo(false);
  };

  const startDemo = () => {
    demoRef.current = true;
    setShop(DEMO_SHOP);
    setInventory(demoInventory());
    setBills(demoBills());
    setDemo(true);
    setSignedIn(true);
  };

  const exitDemo = () => {
    demoRef.current = false;
    setDemo(false);
    setSignedIn(false);
    setShop(readShop());
    setInventory(readInventory());
    setBills(readBills());
  };

  const upsertItem: ShopState["upsertItem"] = (item) => {
    if (demo) {
      setInventory((cur) => (cur.some((i) => i.id === item.id) ? cur.map((i) => (i.id === item.id ? item : i)) : [item, ...cur]));
      return;
    }
    const current = readInventory();
    const exists = current.some((i) => i.id === item.id);
    writeInventory(exists ? current.map((i) => (i.id === item.id ? item : i)) : [item, ...current]);
    refresh();
  };

  const removeItem: ShopState["removeItem"] = (id) => {
    if (demo) {
      setInventory((cur) => cur.filter((i) => i.id !== id));
      return;
    }
    writeInventory(readInventory().filter((i) => i.id !== id));
    refresh();
  };

  const sell: ShopState["sell"] = (lines, meta) => {
    if (demo) {
      setInventory((cur) =>
        cur.map((item) => {
          const hit = lines.find((l) => (l.productId && l.productId === item.productId) || l.name === item.name);
          return hit ? { ...item, qty: Math.max(0, item.qty - hit.qty) } : item;
        }),
      );
      const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
      const gst = Math.round(subtotal * GST_RATE);
      const bill: Bill = {
        id: "INV" + Date.now().toString().slice(-8),
        at: Date.now(),
        customerName: meta.customerName,
        customerPhone: meta.customerPhone,
        lines: lines.map((l) => ({ name: l.name, pack: l.pack, qty: l.qty, price: l.price })),
        subtotal,
        gst,
        total: subtotal + gst,
        source: "counter",
      };
      setBills((cur) => [bill, ...cur]);
      return bill;
    }
    const bill = consumeStock(lines, { ...meta, source: "counter" });
    refresh();
    return bill;
  };

  return (
    <Ctx.Provider
      value={{
        hydrated,
        shop,
        signedIn,
        demo,
        startDemo,
        exitDemo,
        register,
        login,
        logout,
        inventory,
        upsertItem,
        removeItem,
        bills,
        sell,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useShop() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}