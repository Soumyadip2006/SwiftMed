import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore, getProduct } from "@/lib/store";
import { SUPPORT_PHONE } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Phone, PackageCheck, Package, Bike, ArrowLeft, AlertTriangle } from "lucide-react";
import type { OrderStatus } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/order/$id")({
  head: () => ({
    meta: [
      { title: "Order status — MedRush" },
      { name: "description", content: "Track your medicine delivery order." },
    ],
  }),
  component: OrderStatusPage,
});

const STEPS: { key: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "Order Received", label: "Order Received", icon: CheckCircle2 },
  { key: "Being Packed", label: "Being Packed", icon: Package },
  { key: "Out for Delivery", label: "Out for Delivery", icon: Bike },
  { key: "Delivered", label: "Delivered", icon: PackageCheck },
];

function OrderStatusPage() {
  const { id } = Route.useParams();
  const { orders, addToCart, markDelivered, reportIssue } = useStore();
  const navigate = useNavigate();
  const order = orders.find((o) => o.id === id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Loading order…</p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === order.status);
  const isDelivered = order.status === "Delivered";
  const isCancelled = order.status === "Cancelled";
  const canConfirm = order.status === "Out for Delivery";

  const handleConfirmDelivered = () => {
    setConfirming(true);
    markDelivered(order.id);
    setConfirmOpen(false);
    toast.success("Order marked as delivered");
  };

  const handleSubmitIssue = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    reportIssue(order.id, trimmed);
    setIssueOpen(false);
    setReason("");
    toast.success("Issue reported. Our support team will reach out shortly.");
  };

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center gap-3">
        <Link to="/home" className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="text-sm font-semibold">Order {order.id}</div>
          <div className="text-[11px] text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4 pb-32">
        {isDelivered ? (
          <div className="rounded-3xl border bg-primary text-primary-foreground p-6 text-center">
            <PackageCheck className="h-10 w-10 mx-auto" />
            <h1 className="text-xl font-semibold mt-2">Delivered</h1>
            <p className="text-sm opacity-90 mt-1">Thanks for choosing MedRush. Feel better soon!</p>
          </div>
        ) : isCancelled ? (
          <div className="rounded-3xl border bg-card p-6 text-center">
            <h1 className="text-xl font-semibold">Order cancelled</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {order.note ?? "Item unavailable. No payment was collected."}
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Estimated arrival in 10 minutes
            </div>
            <div className="mt-5 space-y-4">
              {STEPS.map((s, i) => {
                const done = i <= currentIndex;
                const active = i === currentIndex;
                const Icon = s.icon;
                return (
                  <div key={s.key} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-full grid place-items-center shrink-0",
                        done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                        active && "ring-4 ring-primary/20",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className={cn("text-sm", done ? "font-medium text-foreground" : "text-muted-foreground")}>
                        {s.label}
                      </div>
                      {done && (
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(
                            order.statusHistory.find((h) => h.status === s.key)?.at ?? order.createdAt,
                          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {order.note && (
              <div className="mt-4 rounded-xl bg-accent text-accent-foreground text-xs p-3">
                {order.note}
              </div>
            )}
            {order.issueReport && (
              <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs p-3 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Issue reported to support</div>
                  <div className="opacity-90">{order.issueReport.reason}</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-semibold mb-2">Delivery details</h2>
          <p className="text-sm">{order.address}</p>
          {order.landmark && <p className="text-sm text-muted-foreground">Landmark: {order.landmark}</p>}
          <p className="text-sm text-muted-foreground">{order.zone}</p>
          <p className="text-sm text-muted-foreground">Contact: {order.contact}</p>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-semibold mb-2">Items</h2>
          <div className="space-y-1.5 text-sm">
            {order.items.map((it) => {
              const p = getProduct(it.productId);
              if (!p) return null;
              return (
                <div key={it.productId} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {p.icon} {p.name} × {it.qty}
                  </span>
                  <span>₹{p.price * it.qty}</span>
                </div>
              );
            })}
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total (COD)</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>

        {isDelivered && (
          <Button
            className="w-full h-12"
            onClick={() => {
              order.items.forEach((i) => addToCart(i.productId, i.qty));
              navigate({ to: "/cart" });
            }}
          >
            Reorder
          </Button>
        )}

        <a
          href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
          className="block rounded-2xl border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">Emergency contact</div>
              <div className="text-xs text-muted-foreground truncate">{SUPPORT_PHONE}</div>
            </div>
            <div className="text-xs font-medium text-primary">Tap to call</div>
          </div>
        </a>
      </div>

      {canConfirm && (
        <div className="fixed bottom-16 inset-x-0 z-20 px-4">
          <div className="max-w-md mx-auto space-y-2">
            <Button
              className="w-full h-12 shadow-lg"
              onClick={() => setConfirmOpen(true)}
              disabled={confirming}
            >
              {confirming ? "Marking as delivered…" : "Had the medicine delivered?"}
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 bg-background shadow-lg"
              onClick={() => setIssueOpen(true)}
              disabled={confirming}
            >
              <AlertTriangle className="h-4 w-4 mr-1.5" />
              Not delivered? Report an issue
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delivery?</AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm you have received order {order.id}. This will close the order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirming}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelivered} disabled={confirming}>
              Yes, delivered
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report a delivery issue</DialogTitle>
            <DialogDescription>
              Tell us what went wrong. Our support team will call you back on {order.contact}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="issue-reason">What happened?</Label>
            <Textarea
              id="issue-reason"
              placeholder="e.g. Rider hasn't arrived, wrong item delivered, item missing…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setIssueOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitIssue} disabled={!reason.trim()}>
              Send to support
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}