import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore, getProduct } from "@/lib/store";
import { DELIVERY_FEE } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, Trash2, Clock, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_app/cart")({
  head: () => ({
    meta: [
      { title: "Cart — MedRush" },
      { name: "description", content: "Review your medicine order before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, updateQty, removeFromCart, cartSubtotal } = useStore();
  const navigate = useNavigate();
  const hasItems = cart.length > 0;
  const items = cart
    .map((i) => ({ item: i, product: getProduct(i.productId) }))
    .filter((x): x is { item: typeof x.item; product: NonNullable<typeof x.product> } => Boolean(x.product));
  const outOfStock = items.some((x) => !x.product.inStock);
  const total = cartSubtotal + (hasItems ? DELIVERY_FEE : 0);

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center gap-3">
        <Link to="/home" className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="font-semibold">Your cart</span>
      </div>

      {!hasItems ? (
        <div className="px-6 py-16 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-secondary grid place-items-center mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground mt-1">Add some essentials to get started.</p>
          <Button className="mt-6 h-11 px-6" onClick={() => navigate({ to: "/home" })}>
            Browse items
          </Button>
        </div>
      ) : (
        <>
          <div className="px-4 py-4 space-y-2">
            {items.map(({ item, product }) => (
              <div key={item.productId} className="rounded-2xl border bg-card p-3 flex gap-3">
                <div className="h-16 w-16 shrink-0 rounded-xl bg-secondary grid place-items-center text-3xl">
                  {product.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-muted-foreground">{product.pack}</div>
                  <div className="text-sm font-medium leading-snug">{product.name}</div>
                  {!product.inStock && (
                    <div className="text-xs text-destructive mt-1">
                      No longer available — please remove
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-md border h-8 px-1">
                      <button className="h-8 w-7 grid place-items-center" onClick={() => updateQty(item.productId, item.qty - 1)}>
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-medium w-5 text-center">{item.qty}</span>
                      <button className="h-8 w-7 grid place-items-center" onClick={() => updateQty(item.productId, item.qty + 1)}>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-sm">₹{product.price * item.qty}</div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-destructive"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4">
            <div className="rounded-2xl border bg-card p-4 space-y-2">
              <Row label="Subtotal" value={`₹${cartSubtotal}`} />
              <Row label="Delivery fee" value={`₹${DELIVERY_FEE}`} />
              <div className="h-px bg-border my-1" />
              <Row label="Total" value={`₹${total}`} bold />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                <Clock className="h-3.5 w-3.5" /> Estimated delivery in ~10 minutes
              </div>
            </div>
          </div>

          <div className="fixed bottom-16 inset-x-0 z-20 px-4 pb-2">
            <div className="max-w-md mx-auto">
              <Button
                className="w-full h-12 text-base"
                disabled={outOfStock}
                onClick={() => navigate({ to: "/checkout" })}
              >
                {outOfStock ? "Remove unavailable item" : `Proceed to Checkout · ₹${total}`}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? "font-semibold" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}