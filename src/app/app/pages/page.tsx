import Link from "next/link";
import { db } from "@/lib/prisma";
import { env } from "@/lib/env";
import { getAuthOnlyPage, isAuthOnlyModeEnabled } from "@/lib/auth-only-mode";
import { requireUser } from "@/lib/auth/guards";
import { getActiveMembership } from "@/lib/server/current-workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthOnlyModeNotice } from "@/components/layout/auth-only-mode-notice";

export default async function LandingPagesPage() {
  const user = await requireUser();
  const activeMembership = await getActiveMembership(user);

  if (!activeMembership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum workspace encontrado</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const authOnlyMode = isAuthOnlyModeEnabled();
  const editorUiEnabled = env.ENABLE_EDITOR_UI;
  const pages = authOnlyMode
    ? [
        {
          ...getAuthOnlyPage(),
          publishedVersion: null,
        },
      ]
    : await db.landingPage.findMany({
        where: { workspaceId: activeMembership.workspaceId },
        include: {
          publishedVersion: {
            select: {
              version: true,
              publishedAt: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

  return (
    <div className="space-y-4">
      {authOnlyMode ? <AuthOnlyModeNotice message="A lista abaixo usa uma landing page mockada para liberar o editor sem banco." /> : null}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-xl font-semibold">Landing pages</h2>
            <p className="text-sm text-muted-foreground">Gerencie drafts, publicações e versões.</p>
          </div>
          <Button asChild>
            <Link href="/app/pages/new">Nova landing page</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {pages.map((page) => (
          <Card key={page.id}>
            <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold">{page.name}</p>
                <p className="text-sm text-muted-foreground">/{page.slug}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={page.status === "published" ? "success" : page.status === "suspended" ? "danger" : "secondary"}>
                    {page.status}
                  </Badge>
                  {page.publishedVersion ? <span className="text-xs text-muted-foreground">v{page.publishedVersion.version}</span> : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {editorUiEnabled ? (
                  <Button variant="outline" asChild>
                    <Link href={`/app/pages/${page.id}/edit`}>Editar</Link>
                  </Button>
                ) : null}
                <Button variant="outline" asChild>
                  <Link href={`/app/pages/${page.id}/preview`} target="_blank">
                    Preview
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/app/pages/${page.id}/versions`}>Versões</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {pages.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma página ainda</CardTitle>
              <CardDescription>Crie a primeira landing page para este workspace.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

