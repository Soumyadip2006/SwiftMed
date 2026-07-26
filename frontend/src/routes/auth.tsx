import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pill, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SwiftMed" },
      { name: "description", content: "Sign in to SwiftMed with your email to order OTC medicines in 10 minutes." },
      { property: "og:title", content: "Sign in — SwiftMed" },
      { property: "og:description", content: "Sign in to SwiftMed with your email." },
    ],
  }),
  component: AuthPage,
});

type Step = "email" | "name";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthPage() {
  const { user, setUser, zone } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (user) navigate({ to: zone ? "/home" : "/" });
  }, [user, zone, navigate]);

  const submitEmail = () => {
    const clean = email.trim().toLowerCase();
    if (!emailRe.test(clean)) {
      toast.error("Enter a valid email address");
      return;
    }
    setEmail(clean);
    setStep("name");
  };

  const saveName = () => {
    const clean = name.trim();
    if (clean.length < 2) {
      toast.error("Please enter your name");
      return;
    }
    setUser({ email, name: clean });
    toast.success(`Welcome, ${clean.split(" ")[0]}!`);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        {step !== "email" && (
          <button
            onClick={() => setStep("email")}
            className="flex items-center gap-1 text-sm text-muted-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}

        <div className="flex items-center gap-2 mb-3 mt-6">
          <div className="h-11 w-11 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-sm">
            <Pill className="h-6 w-6" />
          </div>
          <span className="text-2xl font-semibold tracking-tight">SwiftMed</span>
        </div>

        {step === "email" && (
          <div className="mt-6 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Sign in with email</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll use this to send order updates and receipts.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> Email address
              </label>
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>
            <Button onClick={submitEmail} className="w-full h-12 text-base" disabled={!emailRe.test(email.trim())}>
              Continue
            </Button>
          </div>
        )}

        {step === "name" && (
          <div className="mt-6 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">What should we call you?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll use this on your orders and delivery updates.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your name</label>
              <Input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
                autoFocus
              />
            </div>
            <Button onClick={saveName} className="w-full h-12 text-base" disabled={name.trim().length < 2}>
              Continue
            </Button>
          </div>
        )}

        <p className="mt-auto pt-10 text-xs text-muted-foreground text-center">
          Pilot service. Cash on delivery. OTC & wellness only.
        </p>
      </div>
    </div>
  );
}