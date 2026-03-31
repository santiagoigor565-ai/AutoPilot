"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/auth/guards";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { publicEnv } from "@/lib/public-env";

type WorkspaceSettingsProps = {
  user: AuthUser;
};

const authOnlyMode = publicEnv.NEXT_PUBLIC_ENABLE_AUTH_ONLY_MODE;

export function WorkspaceSettings({ user }: WorkspaceSettingsProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function createWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Erro ao criar workspace." }));
      toast.error(payload.error ?? "Erro ao criar workspace.");
      setIsLoading(false);
      return;
    }

    toast.success("Workspace criado.");
    setName("");
    setIsLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Workspaces</CardTitle>
          <CardDescription>Gerencie seus workspaces e papéis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {user.memberships.map((membership) => (
            <div key={membership.workspaceId} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <div>
                <p className="font-semibold">{membership.workspace.name}</p>
                <p className="text-xs text-muted-foreground">{membership.workspace.slug}</p>
              </div>
              <Badge className="capitalize">{membership.role}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Criar workspace</CardTitle>
        </CardHeader>
        <CardContent>
          {authOnlyMode ? (
            <p className="text-sm text-muted-foreground">Modo local sem banco: criacao real de workspaces esta desativada.</p>
          ) : null}
          <form className="space-y-3" onSubmit={createWorkspace}>
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Nome</Label>
              <Input id="workspace-name" value={name} onChange={(event) => setName(event.target.value)} required disabled={authOnlyMode} />
            </div>
            <Button type="submit" disabled={isLoading || authOnlyMode}>
              {isLoading ? "Criando..." : "Criar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

