import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { Home, Receipt, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, zone } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const rawUser = window.localStorage.getItem("md_user");
      if (!rawUser || rawUser === "null") {
        navigate({ to: "/auth" });
        return;
      }
      const raw = window.localStorage.getItem("md_zone");
      if (!raw || raw === "null") navigate({ to: "/" });
    }
  }, [user, zone, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full pb-24">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur">
        <div className="max-w-md mx-auto grid grid-cols-3">
          <NavItem to="/home" icon={<Home className="h-5 w-5" />} label="Home" />
          <NavItem to="/orders" icon={<Receipt className="h-5 w-5" />} label="Orders" />
          <NavItem to="/account" icon={<User className="h-5 w-5" />} label="Account" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className={cn("py-3 flex flex-col items-center gap-0.5 text-xs text-muted-foreground")}
      activeProps={{ className: "py-3 flex flex-col items-center gap-0.5 text-xs text-primary font-medium" }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}