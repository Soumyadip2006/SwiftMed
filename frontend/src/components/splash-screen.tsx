import { Pill, Loader2 } from "lucide-react";

export function SplashScreen({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden={!visible}
      className={
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 " +
        (visible ? "opacity-100" : "pointer-events-none opacity-0")
      }
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="h-20 w-20 rounded-3xl bg-primary text-primary-foreground grid place-items-center shadow-lg">
          <Pill className="h-10 w-10" />
        </div>
        <div className="text-3xl font-semibold tracking-tight">SwiftMeds</div>
        <p className="text-sm text-muted-foreground">Medicine in 10 minutes</p>
        <Loader2 className="mt-4 h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}