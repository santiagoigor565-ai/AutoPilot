"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type VersionItem = {
  id: string;
  version: number;
  publishedAt: string | Date;
  isRollback: boolean;
  publishedBy: {
    name: string | null;
    email: string;
  } | null;
};

type PageVersionsListProps = {
  pageId: string;
  versions: VersionItem[];
};

export function PageVersionsList({ pageId, versions }: PageVersionsListProps) {
  const [loadingVersionId, setLoadingVersionId] = useState<string | null>(null);

  async function restoreVersion(versionId: string) {
    setLoadingVersionId(versionId);
    const response = await fetch(`/api/pages/${pageId}/versions/${versionId}/restore`, {
      method: "POST",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Falha ao restaurar." }));
      toast.error(payload.error ?? "Falha ao restaurar.");
      setLoadingVersionId(null);
      return;
    }

    toast.success("Versão restaurada e publicada.");
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      {versions.map((version) => (
        <Card key={version.id}>
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">Versão {version.version}</p>
                {version.isRollback ? <Badge variant="warning">rollback</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground">
                Publicada em {format(new Date(version.publishedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
              <p className="text-xs text-muted-foreground">Por {version.publishedBy?.name ?? version.publishedBy?.email ?? "sistema"}</p>
            </div>
            <Button variant="outline" onClick={() => void restoreVersion(version.id)} disabled={loadingVersionId === version.id}>
              <RotateCcw className="h-4 w-4" />
              {loadingVersionId === version.id ? "Restaurando..." : "Restaurar"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

