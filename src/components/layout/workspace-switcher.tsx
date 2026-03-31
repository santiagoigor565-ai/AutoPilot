"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type WorkspaceSwitcherProps = {
  activeWorkspaceId: string | null;
  items: Array<{
    workspaceId: string;
    workspace: {
      name: string;
      slug: string;
    };
  }>;
};

export function WorkspaceSwitcher({ activeWorkspaceId, items }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(activeWorkspaceId ?? items[0]?.workspaceId ?? "");

  async function onChange(workspaceId: string) {
    setSelectedWorkspaceId(workspaceId);

    const response = await fetch("/api/workspaces/active", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Falha ao trocar workspace." }));
      toast.error(payload.error ?? "Falha ao trocar workspace.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
        Nenhum workspace vinculado a esta conta.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-muted/60 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Workspace ativo</p>
      <select
        className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={selectedWorkspaceId}
        onChange={(event) => void onChange(event.target.value)}
        disabled={isPending || items.length === 1}
      >
        {items.map((item) => (
          <option key={item.workspaceId} value={item.workspaceId}>
            {item.workspace.name} ({item.workspace.slug})
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-muted-foreground">
        {isPending ? "Atualizando contexto..." : "Troca o escopo do dashboard, editor e leads."}
      </p>
    </div>
  );
}
