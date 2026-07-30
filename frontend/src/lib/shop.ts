import { CATALOG } from "./catalog";

export type ShopAccount = {
  email: string;
  password: string;
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  drugLicenseRetail: string;
  drugLicenseWholesale?: string;
  licenseValidTill: string;
  gstin: string;
  pan: string;
  pharmacistName: string;
  pharmacistRegNo: string;
  pharmacistCouncil: string;
  fssai?: string;
  createdAt: number;
};

export type InventoryItem = {
  id: string;
  productId?: string;
  name: string;
  pack: string;
  category: string;
  price: number;
  qty: number;
  batch: string;
  expiry: string;
};

export type BillLine = { name: string; pack: string; qty: number; price: number };

export type Bill = {
  id: string;
  at: number;
  customerName: string;
  customerPhone: string;
  lines: BillLine[];
  subtotal: number;
  gst: number;
  total: number;
  source: "counter" | "app";
};

export const SHOP_KEY = "md_shop_account";
export const SHOP_SESSION_KEY = "md_shop_session";
export const INVENTORY_KEY = "md_shop_inventory";
export const BILLS_KEY = "md_shop_bills";
export const GST_RATE = 0.12;
export const LOW_STOCK = 10;
export const INVENTORY_EVENT = "swiftmed:inventory";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function seedInventory(): InventoryItem[] {
  return CATALOG.map((p, i) => ({
    id: "inv_" + p.id,
    productId: p.id,
    name: p.name,
    pack: p.pack,
    category: p.category,
    price: p.price,
    qty: p.inStock ? 20 + ((i * 7) % 40) : 0,
    batch: "B" + (1000 + i),
    expiry: "2027-06",
  }));
}

export function readInventory(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  const existing = read<InventoryItem[] | null>(INVENTORY_KEY, null);
  if (existing && existing.length) return existing;
  const seeded = seedInventory();
  write(INVENTORY_KEY, seeded);
  return seeded;
}

export function writeInventory(items: InventoryItem[]) {
  write(INVENTORY_KEY, items);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(INVENTORY_EVENT));
}

export function readBills(): Bill[] {
  return read<Bill[]>(BILLS_KEY, []);
}

export function writeBills(bills: Bill[]) {
  write(BILLS_KEY, bills);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(INVENTORY_EVENT));
}

export function readShop(): ShopAccount | null {
  return read<ShopAccount | null>(SHOP_KEY, null);
}

export function writeShop(shop: ShopAccount | null) {
  write(SHOP_KEY, shop);
}

/** Reduce stock for purchased products and record a bill. Used by counter billing and customer app orders. */
export function consumeStock(
  lines: { productId?: string; name: string; pack: string; qty: number; price: number }[],
  meta: { customerName: string; customerPhone: string; source: Bill["source"] },
): Bill {
  const inv = readInventory();
  const next = inv.map((item) => {
    const hit = lines.find((l) => (l.productId && l.productId === item.productId) || l.name === item.name);
    return hit ? { ...item, qty: Math.max(0, item.qty - hit.qty) } : item;
  });
  writeInventory(next);

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
    source: meta.source,
  };
  writeBills([bill, ...readBills()]);
  return bill;
}

/** Read-only sample shop used for the no-login preview. */
export const DEMO_SHOP: ShopAccount = {
  email: "demo@swiftmed.store",
  password: "",
  shopName: "Sunrise Medical Store (Demo)",
  ownerName: "Demo Owner",
  phone: "9800000000",
  address: "12, City Centre Market",
  city: "Durgapur",
  pincode: "713216",
  drugLicenseRetail: "WB-DGP-20B-1234",
  drugLicenseWholesale: "WB-DGP-21B-5678",
  licenseValidTill: "2029-03-31",
  gstin: "19ABCDE1234F1Z5",
  pan: "ABCDE1234F",
  pharmacistName: "Dr. A. Sen",
  pharmacistRegNo: "WB-PH-44821",
  pharmacistCouncil: "West Bengal State Pharmacy Council",
  fssai: "10023456789012",
  createdAt: Date.now(),
};

export function demoInventory(): InventoryItem[] {
  const base = seedInventory();
  return base.map((item, i) =>
    i % 7 === 0 ? { ...item, qty: i % 3 } : item,
  );
}

export function demoBills(): Bill[] {
  const now = Date.now();
  const make = (id: string, at: number, customerName: string, lines: BillLine[], source: Bill["source"]): Bill => {
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const gst = Math.round(subtotal * GST_RATE);
    return { id, at, customerName, customerPhone: "9800000001", lines, subtotal, gst, total: subtotal + gst, source };
  };
  return [
    make("INVDEMO01", now - 1000 * 60 * 40, "Rahul Das", [
      { name: "Paracetamol 650mg", pack: "Strip of 10", qty: 2, price: 30 },
      { name: "ORS Orange", pack: "Sachet", qty: 3, price: 22 },
    ], "counter"),
    make("INVDEMO02", now - 1000 * 60 * 120, "App order", [
      { name: "Cetirizine 10mg", pack: "Strip of 10", qty: 1, price: 28 },
    ], "app"),
    make("INVDEMO03", now - 1000 * 60 * 60 * 26, "Priya Ghosh", [
      { name: "Vitamin C 500mg", pack: "Bottle of 30", qty: 1, price: 180 },
      { name: "Band-Aid", pack: "Pack of 20", qty: 2, price: 55 },
    ], "counter"),
  ];
}