import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { env } from "@/lib/env";
import { getAuthOnlyPage, isAuthOnlyModeEnabled, MOCK_PAGE_ID } from "@/lib/auth-only-mode";
import { requireUser } from "@/lib/auth/guards";
import { assertWorkspaceAccess } from "@/lib/server/services/page-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageVersionsList } from "@/components/builder/page-versions-list";
import { AuthOnlyModeNotice } from "@/components/layout/auth-only-mode-notice";

export default async function PageVersionsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const user = await requireUser();
  const { pageId } = await params;
  const editorUiEnabled = env.ENABLE_EDITOR_UI;

  if (isAuthOnlyModeEnabled() && pageId === MOCK_PAGE_ID) {
    const page = getAuthOnlyPage();
    return (
      <div className="space-y-4">
        <AuthOnlyModeNotice message="Versionamento real depende do banco. Esta tela mostra apenas um snapshot local ilustrativo." />
        <Card>
          <CardHeader>
            <CardTitle>Versoes da pagina</CardTitle>
            <CardDescription>Historico mockado para navegar na interface.</CardDescription>
          </CardHeader>
          {editorUiEnabled ? (
            <CardContent className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`/app/pages/${page.id}/edit`}>Voltar ao editor</Link>
              </Button>
            </CardContent>
          ) : null}
        </Card>
        <PageVersionsList
          pageId={page.id}
          versions={[
            {
              id: "mock-version-1",
              version: 1,
              publishedAt: new Date().toISOString(),
              isRollback: false,
              publishedBy: {
                name: user.name,
                email: user.email,
              },
            },
          ]}
        />
      </div>
    );
  }

  const page = await db.landingPage.findUnique({
    where: { id: pageId },
  });

  if (!page) {
    return notFound();
  }

  await assertWorkspaceAccess(user.id, page.workspaceId, "viewer");

  const versions = await db.pageVersion.findMany({
    where: { landingPageId: pageId },
    include: {
      publishedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { version: "desc" },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Versões da página</CardTitle>
          <CardDescription>Histórico de publicação e rollback de snapshots.</CardDescription>
        </CardHeader>
        {editorUiEnabled ? (
          <CardContent className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/app/pages/${page.id}/edit`}>Voltar ao editor</Link>
            </Button>
          </CardContent>
        ) : null}
      </Card>

      <PageVersionsList
        pageId={page.id}
        versions={versions.map((version) => ({
          id: version.id,
          version: version.version,
          publishedAt: version.publishedAt,
          isRollback: version.isRollback,
          publishedBy: version.publishedBy,
        }))}
      />
    </div>
  );
}

