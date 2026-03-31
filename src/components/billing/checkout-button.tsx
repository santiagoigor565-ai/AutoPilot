"use client";

import { useState } from "react";
import type { BillingCycle, BillingPlanCode } from "@/lib/billing/plans";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type CheckoutButtonProps = {
  workspaceId: string;
  planCode: BillingPlanCode;
  cycle: BillingCycle;
  label: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
};

export function CheckoutButton({
  workspaceId,
  planCode,
  cycle,
  label,
  disabled = false,
  variant = "outline",
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCheckout() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, planCode, cycle }),
      });

      const payload = (await response.json().catch(() => null)) as { checkoutUrl?: string; error?: string } | null;
      if (!response.ok || !payload?.checkoutUrl) {
        throw new Error(payload?.error ?? "Não foi possível iniciar o checkout.");
      }

      window.open(payload.checkoutUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao abrir checkout.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant={variant} className="w-full" onClick={handleCheckout} disabled={disabled || isLoading}>
      {isLoading ? "Abrindo..." : label}
    </Button>
  );
}

