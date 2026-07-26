import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ZONES } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/")({
  component: ZoneCheck,
});

function ZoneCheck() {
  const { user, zone, setZone } = useStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>("");
  const [notServed, setNotServed] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifySent, setNotifySent] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (zone) navigate({ to: "/home" });
  }, [user, zone, navigate]);

  const confirm = () => {
    if (!selected) return;
    if (selected === "__other__") {
      setNotServed(true);
      return;
    }
    setZone(selected);
    navigate({ to: "/home" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-11 w-11 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-sm">
            <Pill className="h-6 w-6" />
          </div>
          <span className="text-2xl font-semibold tracking-tight">MedRush</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-center">Medicine in 10 minutes</h1>
        <p className="mt-2 text-muted-foreground text-center flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> OTC & wellness, delivered to your door
        </p>

        {!notServed ? (
          <div className="mt-10 w-full space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> Delivery zone
              </label>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your area or pincode" />
                </SelectTrigger>
                <SelectContent>
                  {ZONES.map((z) => (
                    <SelectItem key={z} value={z}>
                      {z}
                    </SelectItem>
                  ))}
                  <SelectItem value="__other__">Other / not listed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={confirm} disabled={!selected} className="w-full h-12 text-base">
              Check availability
            </Button>
          </div>
        ) : (
          <div className="mt-10 w-full space-y-4 rounded-2xl border bg-card p-5">
            <div>
              <h2 className="font-semibold">We're not in your area yet</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Leave your number and we'll ping you the moment MedRush launches nearby.
              </p>
            </div>
            {!notifySent ? (
              <div className="space-y-3">
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={notifyPhone}
                  onChange={(e) => setNotifyPhone(e.target.value)}
                  className="h-12"
                />
                <Button
                  onClick={() => notifyPhone.trim() && setNotifySent(true)}
                  className="w-full h-12"
                  disabled={!notifyPhone.trim()}
                >
                  Notify me
                </Button>
                <button
                  className="text-sm text-muted-foreground w-full text-center underline"
                  onClick={() => setNotServed(false)}
                >
                  Pick a different zone
                </button>
              </div>
            ) : (
              <p className="text-sm">Thanks! We'll be in touch soon.</p>
            )}
          </div>
        )}

        <p className="mt-10 text-xs text-muted-foreground text-center">
          Pilot service. Cash on delivery. OTC & wellness only.
        </p>
        <Link to="/home" className="hidden">skip</Link>
      </div>
    </div>
  );
}