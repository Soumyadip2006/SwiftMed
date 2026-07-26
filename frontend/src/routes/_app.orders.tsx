import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore, getProduct } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/orders")({
  head: () => ({
    meta: [
      { title: "Your orders — MedRush" },
      { name: "description", content: "See past MedRush orders and reorder in one tap." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { orders, addToCart } = useStore();
  const navigate = useNavigate();

  const inProgress = orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled");
  const past = orders.filter((o) => o.status === "Delivered" || o.status === "Cancelled");

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Your orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="px-6 py-16 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-secondary grid place-items-center mb-4">
            <Receipt className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">No orders yet</h2>
          <p className="text-sm text-muted-foreground mt-1">Your past orders will appear here.</p>
          <Button className="mt-6 h-11 px-6" onClick={() => navigate({ to: "/home" })}>
            Browse items
          </Button>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-4">
          {inProgress.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground">In progress</h2>
              {inProgress.map((o) => (
                <Link
                  key={o.id}
                  to="/order/$id"
                  params={{ id: o.id }}
                  className="block rounded-2xl border bg-card p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold">Order {o.id}</div>
                      <div className="text-xs text-muted-foreground">{summarize(o.items)}</div>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Track order →</span>
                    <span className="font-semibold">₹{o.total}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Past orders</h2>
              {past.map((o) => (
                <div key={o.id} className="rounded-2xl border bg-card p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold">Order {o.id}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString()} · {summarize(o.items)}
                      </div>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="font-semibold">₹{o.total}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        o.items.forEach((i) => addToCart(i.productId, i.qty));
                        navigate({ to: "/cart" });
                      }}
                    >
                      Reorder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function summarize(items: { productId: string; qty: number }[]) {
  const names = items.map((i) => getProduct(i.productId)?.name).filter(Boolean) as string[];
  const count = items.reduce((s, i) => s + i.qty, 0);
  const preview = names.slice(0, 2).join(", ");
  const extra = names.length > 2 ? ` +${names.length - 2} more` : "";
  return `${count} item${count === 1 ? "" : "s"} · ${preview}${extra}`;
}

function StatusBadge({ status }: { status: string }) {
  const isDone = status === "Delivered";
  const isCancelled = status === "Cancelled";
  return (
    <span
      className={cn(
        "text-[11px] font-medium rounded-full px-2 py-0.5",
        isDone && "bg-primary/10 text-primary",
        isCancelled && "bg-destructive/10 text-destructive",
        !isDone && !isCancelled && "bg-accent text-accent-foreground",
      )}
    >
      {status}
    </span>
  );
}