import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, getProduct } from "@/lib/store";
import { DELIVERY_FEE } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Wallet } from "lucide-react";

export const Route = createFileRoute("/_app/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — MedRush" },
      { name: "description", content: "Confirm delivery details and place your COD order." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { zone, cart, cartSubtotal, placeOrder } = useStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<{ address?: string; contact?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const total = cartSubtotal + DELIVERY_FEE;
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  const submit = () => {
    const e: typeof errors = {};
    if (!address.trim()) e.address = "Address is required";
    if (!contact.trim() || contact.replace(/\D/g, "").length < 10)
      e.contact = "Enter a valid 10-digit number";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    try {
      const order = placeOrder({
        items: cart,
        subtotal: cartSubtotal,
        deliveryFee: DELIVERY_FEE,
        total,
        address: address.trim(),
        landmark: landmark.trim(),
        contact: contact.trim(),
        zone: zone ?? "",
      });
      navigate({ to: "/order/$id", params: { id: order.id } });
    } catch {
      setSubmitting(false);
      alert("Something went wrong placing your order. Please try again.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/home" })}>Browse items</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center gap-3">
        <Link to="/cart" className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="font-semibold">Checkout</span>
      </div>

      <div className="px-4 py-4 space-y-4 pb-32">
        <section className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Delivering to</div>
              <div className="text-sm font-medium">{zone}</div>
            </div>
            <Link to="/" className="text-primary text-sm underline">Change</Link>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold">Cart details</h2>
          <div className="space-y-3">
            {cart.map((item) => {
              const p = getProduct(item.productId);
              if (!p) return null;
              return (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary grid place-items-center text-lg shrink-0">
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.pack} · ×{item.qty}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">₹{p.price * item.qty}</div>
                </div>
              );
            })}
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
            <span>₹{cartSubtotal}</span>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold">Delivery address</h2>
          <div className="space-y-1">
            <Textarea
              placeholder="Flat / house no, building, street"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="min-h-[80px]"
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>
          <Input
            placeholder="Landmark (optional)"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            className="h-11"
          />
          <div className="space-y-1">
            <Input
              type="tel"
              placeholder="Contact number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="h-11"
            />
            {errors.contact && <p className="text-xs text-destructive">{errors.contact}</p>}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-semibold mb-2">Payment method</h2>
          <div className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-3">
            <Wallet className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="text-sm font-medium">Cash on Delivery</div>
              <div className="text-xs text-muted-foreground">Pay the rider when your order arrives</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-4 space-y-2 text-sm">
          <h2 className="text-sm font-semibold">Order summary</h2>
          <div className="flex justify-between text-muted-foreground">
            <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
            <span>₹{cartSubtotal}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery fee</span>
            <span>₹{DELIVERY_FEE}</span>
          </div>
          <div className="h-px bg-border my-1" />
          <div className="flex justify-between font-semibold">
            <span>Total (COD)</span>
            <span>₹{total}</span>
          </div>
        </section>
      </div>

      <div className="fixed bottom-16 inset-x-0 z-20 px-4 pb-2">
        <div className="max-w-md mx-auto">
          <Button className="w-full h-12 text-base" onClick={submit} disabled={submitting}>
            {submitting ? "Placing order..." : `Place Order · ₹${total}`}
          </Button>
        </div>
      </div>
    </div>
  );
}