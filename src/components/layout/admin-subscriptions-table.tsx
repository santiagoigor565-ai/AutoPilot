"use client";

import { useState } from "react";
import type { SubscriptionStatus } from "@prisma/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SubscriptionRow = {
  id: string;
  workspaceId: string;
  status: SubscriptionStatus;
  planCode: string;
  workspace: { name: string; slug: string };
};

const statusOptions: SubscriptionStatus[] = ["trial", "active", "past_due", "canceled", "paused", "suspended"];

type AdminSubscriptionsTableProps = {
  items: SubscriptionRow[];
};

export function AdminSubscriptionsTable({ items }: AdminSubscriptionsTableProps) {
  const [statusMap, setStatusMap] = useState<Record<string, SubscriptionStatus>>(
    Object.fromEntries(items.map((item) => [item.workspaceId, item.status])),
  );
  const [loadingWorkspaceId, setLoadingWorkspaceId] = useState<string | null>(null);

  async function saveStatus(workspaceId: string) {
    const status = statusMap[workspaceId];
    setLoadingWorkspaceId(workspaceId);

    const response = await fetch(`/api/admin/subscriptions/${workspaceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Falha ao atualizar assinatura." }));
      toast.error(payload.error ?? "Falha ao atualizar assinatura.");
      setLoadingWorkspaceId(null);
      return;
    }

    toast.success("Assinatura atualizada.");
    setLoadingWorkspaceId(null);
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="grid gap-3 p-5 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <p className="font-semibold">{item.workspace.name}</p>
              <p className="text-xs text-muted-foreground">{item.workspace.slug}</p>
              <p className="text-xs text-muted-foreground">Plano: {item.planCode}</p>
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={statusMap[item.workspaceId] ?? item.status}
              onChange={(event) =>
                setStatusMap((prev) => ({
                  ...prev,
                  [item.workspaceId]: event.target.value as SubscriptionStatus,
                }))
              }
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <Button size="sm" onClick={() => void saveStatus(item.workspaceId)} disabled={loadingWorkspaceId === item.workspaceId}>
              {loadingWorkspaceId === item.workspaceId ? "Salvando..." : "Salvar"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
