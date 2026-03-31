import Link from "next/link";
import { env } from "@/lib/env";
import { isAuthOnlyModeEnabled } from "@/lib/auth-only-mode";
import { requireUser } from "@/lib/auth/guards";
import { getActiveMembership } from "@/lib/server/current-workspace";
import { CreatePageAiForm } from "@/components/builder/create-page-ai-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthOnlyModeNotice } from "@/components/layout/auth-only-mode-notice";

export default async function NewLandingPagePage() {
  const user = await requireUser();
  const activeMembership = await getActiveMembership(user);
  const editorUiEnabled = env.ENABLE_EDITOR_UI;

  if (!activeMembership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum workspace ativo</CardTitle>
          <CardDescription>Crie um workspace para continuar.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isAuthOnlyModeEnabled()) {
    return (
      <div className="space-y-4">
        <AuthOnlyModeNotice message="A criacao persistente de paginas continua dependente do banco. Para hoje, use a landing mockada do editor." />
        <Card>
          <CardHeader>
            <CardTitle>Editor mockado</CardTitle>
            <CardDescription>Abra uma landing local para iterar na interface e no builder.</CardDescription>
          </CardHeader>
          {editorUiEnabled ? (
            <CardContent>
              <Button asChild>
                <Link href="/app/pages/mock/edit">Abrir editor local</Link>
              </Button>
            </CardContent>
          ) : (
            <CardContent>
              <p className="text-sm text-muted-foreground">Editor manual oculto nesta etapa. Ative ENABLE_EDITOR_UI para exibir.</p>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  return <CreatePageAiForm workspaceId={activeMembership.workspaceId} />;
}
