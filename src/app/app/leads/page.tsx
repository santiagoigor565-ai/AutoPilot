import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { db } from "@/lib/prisma";
import { isAuthOnlyModeEnabled } from "@/lib/auth-only-mode";
import { requireUser } from "@/lib/auth/guards";
import { getActiveMembership } from "@/lib/server/current-workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthOnlyModeNotice } from "@/components/layout/auth-only-mode-notice";

export default async function LeadsPage() {
  const user = await requireUser();
  const activeMembership = await getActiveMembership(user);

  if (!activeMembership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum workspace ativo</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const authOnlyMode = isAuthOnlyModeEnabled();
  const leads = authOnlyMode
    ? []
    : await db.lead.findMany({
        where: { workspaceId: activeMembership.workspaceId },
        include: {
          landingPage: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      });

  return (
    <div className="space-y-4">
      {authOnlyMode ? <AuthOnlyModeNotice message="Captura de leads fica indisponivel sem banco. Use esta tela apenas como referencia de interface." /> : null}
      <Card>
        <CardHeader>
          <CardTitle>Leads capturados</CardTitle>
          <CardDescription>Todos os contatos recebidos pelas landing pages publicadas.</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {leads.map((lead) => (
          <Card key={lead.id}>
            <CardContent className="grid gap-2 p-5 md:grid-cols-[1fr_1fr_auto] md:items-center">
              <div>
                <p className="font-semibold">{lead.name}</p>
                <p className="text-sm text-muted-foreground">{lead.email}</p>
                {lead.phone ? <p className="text-xs text-muted-foreground">{lead.phone}</p> : null}
              </div>
              <div>
                <p className="text-sm font-medium">{lead.landingPage.name}</p>
                <p className="text-xs text-muted-foreground">/{lead.landingPage.slug}</p>
                {lead.company ? <p className="text-xs text-muted-foreground">{lead.company}</p> : null}
              </div>
              <p className="text-xs text-muted-foreground">{format(lead.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
            </CardContent>
          </Card>
        ))}

        {leads.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhum lead ainda</CardTitle>
              <CardDescription>Adicione um bloco de formulário e publique a página para começar a captar.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

