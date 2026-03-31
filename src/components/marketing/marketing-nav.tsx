import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MarketingNavProps = {
  mode?: "default" | "pricing";
};

export function MarketingNav({ mode = "default" }: MarketingNavProps) {
  const isPricing = mode === "pricing";

  return (
    <header className={cn("sticky top-0 z-30 backdrop-blur", isPricing ? "border-b border-[#c5d7f1] bg-[#f3f8ff]/95" : "border-b border-[#102c50]/20 bg-[#0b1f38]/92")}>
      <div className="mx-auto flex w-full max-w-[1520px] items-center justify-between px-2 py-4 md:px-3">
        <Link href="/" className={cn("text-sm font-semibold uppercase tracking-[0.18em]", isPricing ? "text-[#234f7f]" : "text-[#d4e8ff]")}>
          AutoPilot.com
        </Link>
        <nav className={cn("hidden items-center gap-6 text-sm md:flex", isPricing ? "text-[#3d5e88]" : "text-[#c7dcf5]")}>
          <Link href="/pricing" className={cn("transition-colors", isPricing ? "hover:text-[#0077ff]" : "hover:text-white")}>
            Planos
          </Link>
          <Link href="/faq" className={cn("transition-colors", isPricing ? "hover:text-[#0077ff]" : "hover:text-white")}>
            FAQ
          </Link>
          <Link href="/login" className={cn("transition-colors", isPricing ? "hover:text-[#0077ff]" : "hover:text-white")}>
            Entrar
          </Link>
        </nav>
        <Button
          asChild
          size="sm"
          className={cn(
            isPricing
              ? "rounded-full border border-[#0077ff]/30 bg-[linear-gradient(180deg,#2b8cff,#0067e6)] text-[#eef6ff] hover:bg-[linear-gradient(180deg,#2394ff,#005fd3)]"
              : "rounded-full border border-[#00b8ff]/25 bg-[linear-gradient(180deg,#238dff,#0069e8)] text-[#eef6ff] hover:bg-[linear-gradient(180deg,#2c96ff,#0a63d2)]",
          )}
        >
          <Link href="/signup">Criar conta</Link>
        </Button>
      </div>
    </header>
  );
}

