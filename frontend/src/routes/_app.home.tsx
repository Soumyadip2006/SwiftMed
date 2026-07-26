import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CATALOG, CATEGORIES, ZONES } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Minus, ShoppingBag, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/home")({
  head: () => ({
    meta: [
      { title: "Browse — MedRush" },
      { name: "description", content: "Browse OTC medicines and wellness essentials for 10-minute delivery." },
      { property: "og:title", content: "Browse — MedRush" },
      { property: "og:description", content: "OTC & wellness catalogue for hyperlocal 10-minute delivery." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user, zone, setZone, cart, addToCart, updateQty, cartCount, cartSubtotal } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return CATALOG.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, cat]);

  const qtyOf = (id: string) => cart.find((i) => i.productId === id)?.qty ?? 0;

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-stretch justify-between gap-3">
            <div className="min-w-0 flex flex-col items-start">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground leading-none">Delivering to</div>
              <div className="mt-1.5 flex flex-col items-start gap-0.5">
                <div className="text-sm font-medium truncate leading-tight">{user?.name || "Guest"}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground truncate max-w-[180px] leading-tight">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {zone || "Select delivery zone"}
                </div>
              </div>
            </div>
            <div className="shrink-0 text-right mt-auto">
              <Select value={zone ?? ""} onValueChange={(value) => setZone(value || null)}>
                <SelectTrigger className="text-primary text-xs underline border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 focus:ring-offset-0 [&>svg]:hidden text-right">
                  Change
                </SelectTrigger>
                <SelectContent align="end" className="max-w-[260px]">
                  {ZONES.map((z) => (
                    <SelectItem key={z} value={z} className="data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-medium">
                      {z}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines, wellness..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
          <Chip active={cat === null} onClick={() => setCat(null)}>All</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No items found — try another search or browse categories.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => {
              const qty = qtyOf(p.id);
              return (
                <div
                  key={p.id}
                  className={cn(
                    "rounded-2xl border bg-card p-3 flex flex-col",
                    !p.inStock && "opacity-60",
                  )}
                >
                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="flex flex-col flex-1"
                  >
                    <div className="aspect-square rounded-xl bg-secondary grid place-items-center text-4xl mb-2">
                      {p.icon}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{p.pack}</div>
                    <div className="text-sm font-medium leading-snug line-clamp-2 min-h-[2.5rem]">
                      {p.name}
                    </div>
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="font-semibold">₹{p.price}</div>
                    {!p.inStock ? (
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Out of stock
                      </span>
                    ) : qty === 0 ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() => addToCart(p.id)}
                      >
                        <Plus className="h-4 w-4" /> Add
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1 rounded-md bg-primary text-primary-foreground h-8 px-1">
                        <button className="h-8 w-7 grid place-items-center" onClick={() => updateQty(p.id, qty - 1)}>
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{qty}</span>
                        <button className="h-8 w-7 grid place-items-center" onClick={() => updateQty(p.id, qty + 1)}>
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-16 inset-x-0 z-20 px-4 pb-2">
          <Link
            to="/cart"
            className="max-w-md mx-auto flex items-center justify-between bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-sm font-medium">
                {cartCount} {cartCount === 1 ? "item" : "items"} · ₹{cartSubtotal}
              </span>
            </div>
            <span className="text-sm font-semibold">View cart →</span>
          </Link>
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-sm border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-foreground border-border hover:border-primary/50",
      )}
    >
      {children}
    </button>
  );
}