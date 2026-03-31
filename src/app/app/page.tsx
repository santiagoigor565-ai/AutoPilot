import Link from "next/link";
import { db } from "@/lib/prisma";
import { isAuthOnlyModeEnabled } from "@/lib/auth-only-mode";
import { requireUser } from "@/lib/auth/guards";
import { getActiveMembership } from "@/lib/server/current-workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthOnlyModeNotice } from "@/components/layout/auth-only-mode-notice";

export default async function AppDashboardPage() {
  const user = await requireUser();
  const activeMembership = await getActiveMembership(user);

  if (!activeMembership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum workspace encontrado</CardTitle>
          <CardDescription>Crie um workspace para começar.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const authOnlyMode = isAuthOnlyModeEnabled();
  const workspaceId = activeMembership.workspaceId;
  const mockPublishedCount = 0;
  const [pagesCount, publishedCount, viewsCount, subscription] = authOnlyMode
    ? [1, mockPublishedCount, 0, { status: "trial" }]
    : await Promise.all([
        db.landingPage.count({ where: { workspaceId } }),
        db.landingPage.count({ where: { workspaceId, status: "published" } }),
        db.lead.count({ where: { workspaceId } }),
        db.subscription.findUnique({ where: { workspaceId } }),
      ]);

  return (
    <div className="space-y-4">
      {authOnlyMode ? <AuthOnlyModeNotice /> : null}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Visão geral do workspace {activeMembership.workspace.name}.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Landings</CardDescription>
            <CardTitle className="text-3xl">{pagesCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Publicadas</CardDescription>
            <CardTitle className="text-3xl">{publishedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Visualizacoes</CardDescription>
            <CardTitle className="text-3xl">{viewsCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Status do plano</CardDescription>
            <CardTitle className="text-2xl capitalize">{subscription?.status ?? "trial"}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-3 p-6">
          <Button asChild>
            <Link href="/app/pages/new">Criar landing page</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/app/pages">Ver páginas</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/app/leads">Ver leads</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

