"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AdminPageRow = {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "published" | "suspended";
  workspace: { name: string; slug: string };
};

type AdminPagesTableProps = {
  items: AdminPageRow[];
};

export function AdminPagesTable({ items }: AdminPagesTableProps) {
  const [loadingPageId, setLoadingPageId] = useState<string | null>(null);

  async function suspendPage(pageId: string) {
    setLoadingPageId(pageId);
    const response = await fetch(`/api/admin/pages/${pageId}/suspend`, {
      method: "POST",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Falha ao suspender." }));
      toast.error(payload.error ?? "Falha ao suspender.");
      setLoadingPageId(null);
      return;
    }

    toast.success("Publicação suspensa.");
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.workspace.name} /{item.slug}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={item.status === "published" ? "success" : item.status === "suspended" ? "danger" : "secondary"}>
                {item.status}
              </Badge>
              {item.status === "published" ? (
                <Button variant="outline" size="sm" onClick={() => void suspendPage(item.id)} disabled={loadingPageId === item.id}>
                  {loadingPageId === item.id ? "Suspendendo..." : "Suspender"}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

