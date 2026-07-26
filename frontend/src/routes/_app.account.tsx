import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut, User as UserIcon, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/account")({
  head: () => ({
    meta: [
      { title: "Account — MedRush" },
      { name: "description", content: "Manage your MedRush profile, contact details, and delivery address." },
      { property: "og:title", content: "Account — MedRush" },
      { property: "og:description", content: "Manage your MedRush profile and delivery address." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, setUser, setZone, clearCart } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setAddress(user?.address ?? "");
  }, [user]);

  if (!user) return null;

  const trimmedName = name.trim();
  const trimmedPhone = phone.replace(/\D/g, "");
  const trimmedAddress = address.trim();

  const nameValid = trimmedName.length >= 2;
  const phoneValid = trimmedPhone.length === 0 || trimmedPhone.length === 10;

  const dirty =
    (nameValid && trimmedName !== user.name) ||
    (phoneValid && trimmedPhone !== (user.phone ?? "")) ||
    trimmedAddress !== (user.address ?? "");

  const save = () => {
    if (!nameValid) {
      toast.error("Please enter your name");
      return;
    }
    if (!phoneValid) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    setUser({
      ...user,
      name: trimmedName,
      phone: trimmedPhone || undefined,
      address: trimmedAddress || undefined,
    });
    toast.success("Profile updated");
  };

  const logout = () => {
    clearCart();
    setZone(null);
    setUser(null);
    navigate({ to: "/auth" });
  };

  return (
    <div className="px-5 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" /> {user.email}
        </p>
      </div>

      <section className="rounded-2xl border bg-card p-5 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <UserIcon className="h-4 w-4" /> Name
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <Mail className="h-4 w-4" /> Email
          </label>
          <Input value={user.email} readOnly disabled className="h-12" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <Phone className="h-4 w-4" /> Phone number
          </label>
          <div className="flex items-center gap-2">
            <div className="h-12 rounded-md border bg-muted px-3 grid place-items-center text-sm font-medium">
              +91
            </div>
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="h-12 flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> Delivery address
          </label>
          <Textarea
            placeholder="Flat / house no, building, street, area"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="min-h-[90px]"
          />
        </div>

        <Button onClick={save} disabled={!dirty || !nameValid || !phoneValid} className="w-full h-11">
          Save changes
        </Button>
      </section>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="w-full h-12 text-destructive">
            <LogOut className="h-4 w-4 mr-2" /> Log out
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of MedRush?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again with your email. Your order history stays on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={logout}>Log out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="text-xs text-muted-foreground text-center">Pilot service. Cash on delivery. OTC & wellness only.</p>
    </div>
  );
}