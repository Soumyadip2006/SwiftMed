import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { getProduct, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.product.name} — MedRush` : "Product — MedRush" },
      { name: "description", content: loaderData?.product.description ?? "Medicine details" },
    ],
  }),
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="p-8 text-center text-muted-foreground">Item not found.</div>
  ),
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center gap-3">
        <Link to="/home" className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-sm font-medium truncate">{product.name}</span>
      </div>

      <div className="px-4 pt-4 pb-32">
        <div className="aspect-square rounded-3xl bg-secondary grid place-items-center text-8xl">
          {product.icon}
        </div>
        <div className="mt-5 space-y-1">
          <div className="text-xs text-muted-foreground">{product.category} · {product.pack}</div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <div className="text-xl font-semibold pt-1">₹{product.price}</div>
        </div>
        <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{product.description}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Please consult a physician before use.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Quantity</span>
          <div className="flex items-center gap-1 rounded-lg border h-10 px-1">
            <button className="h-10 w-9 grid place-items-center" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium w-6 text-center">{qty}</span>
            <button className="h-10 w-9 grid place-items-center" onClick={() => setQty((q) => q + 1)}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 inset-x-0 z-20 px-4 pb-2">
        <div className="max-w-md mx-auto">
          {product.inStock ? (
            <Button
              className="w-full h-12 text-base"
              onClick={() => {
                addToCart(product.id, qty);
                navigate({ to: "/cart" });
              }}
            >
              Add to Cart · ₹{product.price * qty}
            </Button>
          ) : (
            <Button className="w-full h-12" disabled>Out of stock</Button>
          )}
        </div>
      </div>
    </div>
  );
}