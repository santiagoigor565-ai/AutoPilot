import Link from "next/link";
import { db } from "@/lib/prisma";
import { isAuthOnlyModeEnabled } from "@/lib/auth-only-mode";
import { requireUser } from "@/lib/auth/guards";
import { getActiveMembership } from "@/lib/server/current-workspace";
import { getBillingProvider } from "@/lib/billing";
import { billingPlanCatalog, formatCurrencyFromCents } from "@/lib/billing/plans";
import { buildPlanFallbackWhatsapp } from "@/lib/billing/checkout-links";
import { buildWhatsappHref } from "@/lib/contact";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthOnlyModeNotice } from "@/components/layout/auth-only-mode-notice";
import { CheckoutButton } from "@/components/billing/checkout-button";

const statusLabels: Record<string, string> = {
  trial: "Trial",
  active: "Ativo",
  past_due: "Atrasado",
  canceled: "Cancelado",
  paused: "Pausado",
  suspended: "Suspenso",
};

type PlanId = "trial" | "basic" | "pleno" | "commerce";

function resolveActivePlan(status: string, planCode: string): PlanId {
  if (status === "trial") return "trial";
  if (planCode === "commerce") return "commerce";
  if (planCode === "pleno") return "pleno";
  return "basic";
}

const commerceWhatsapp = buildPlanFallbackWhatsapp("commerce", "monthly");

export default async function SubscriptionPage() {
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
  const providerName = authOnlyMode ? "mock-local" : getBillingProvider().providerName;
  const [subscription, pagesPublished, allowance] = authOnlyMode
    ? [{ status: "trial", planCode: "local", providerSubscriptionId: null, currentPeriodEnd: null }, 0, { allowed: true }]
    : await (async () => {
        const provider = getBillingProvider();
        return Promise.all([
          provider.getWorkspaceSubscription(activeMembership.workspaceId),
          db.landingPage.count({
            where: {
              workspaceId: activeMembership.workspaceId,
              status: "published",
            },
          }),
          provider.canPublish(activeMembership.workspaceId),
        ]);
      })();

  const activePlan = resolveActivePlan(subscription.status, subscription.planCode);
  const basic = billingPlanCatalog.basic;
  const pleno = billingPlanCatalog.pleno;
  const supportWhatsapp = buildWhatsappHref("Oi! Quero falar sobre meu plano no dashboard.");

  return (
    <div className="space-y-4">
      {authOnlyMode ? <AuthOnlyModeNotice message="Billing está em modo mock local. Publicação real continua dependente do banco." /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
          <CardDescription>Escolha seu plano e avance para checkout via Asaas ou atendimento no WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant={allowance.allowed ? "success" : "warning"}>
            {allowance.allowed ? "Publicação liberada" : "Publicação bloqueada"}
          </Badge>
          <Badge variant="secondary">Status: {statusLabels[subscription.status] ?? subscription.status}</Badge>
          <Badge variant="outline">Provider: {providerName}</Badge>
          <Badge variant="outline">Publicadas: {pagesPublished}</Badge>
          <Button asChild variant="outline" size="sm">
            <a href={supportWhatsapp} target="_blank" rel="noreferrer">
              Suporte no WhatsApp
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className={activePlan === "basic" ? "border-primary shadow-sm" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              Basic
              {activePlan === "basic" ? <Badge>Plano ativo</Badge> : <Badge variant="secondary">Entrada</Badge>}
            </CardTitle>
            <CardDescription>{basic.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-semibold">
              {basic.monthlyPriceCents ? formatCurrencyFromCents(basic.monthlyPriceCents) : "-"}
              <span className="text-base font-medium text-muted-foreground">/mes</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {basic.annualPriceCents ? `${formatCurrencyFromCents(basic.annualPriceCents)}/ano` : "Anual indisponível"}.
            </p>
            <CheckoutButton
              workspaceId={activeMembership.workspaceId}
              planCode="basic"
              cycle="monthly"
              label={activePlan === "basic" ? "Plano em uso" : "Assinar Basic mensal"}
              disabled={activePlan === "basic"}
              variant={activePlan === "basic" ? "default" : "outline"}
            />
            <CheckoutButton workspaceId={activeMembership.workspaceId} planCode="basic" cycle="annual" label="Assinar Basic anual" />
          </CardContent>
        </Card>

        <Card className={activePlan === "pleno" ? "border-primary shadow-sm" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              Pleno
              {activePlan === "pleno" ? <Badge>Plano ativo</Badge> : <Badge variant="secondary">Mais escolhido</Badge>}
            </CardTitle>
            <CardDescription>{pleno.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-semibold">
              {pleno.monthlyPriceCents ? formatCurrencyFromCents(pleno.monthlyPriceCents) : "-"}
              <span className="text-base font-medium text-muted-foreground">/mes</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {pleno.annualPriceCents ? `${formatCurrencyFromCents(pleno.annualPriceCents)}/ano` : "Anual indisponível"}.
            </p>
            <CheckoutButton
              workspaceId={activeMembership.workspaceId}
              planCode="pleno"
              cycle="monthly"
              label={activePlan === "pleno" ? "Plano em uso" : "Assinar Pleno mensal"}
              disabled={activePlan === "pleno"}
              variant={activePlan === "pleno" ? "default" : "outline"}
            />
            <CheckoutButton workspaceId={activeMembership.workspaceId} planCode="pleno" cycle="annual" label="Assinar Pleno anual" />
          </CardContent>
        </Card>

        <Card className={activePlan === "commerce" ? "border-primary shadow-sm" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              Commerce
              {activePlan === "commerce" ? <Badge>Plano ativo</Badge> : null}
            </CardTitle>
            <CardDescription>{billingPlanCatalog.commerce.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-semibold">Personalizado</p>
            <p className="text-sm text-muted-foreground">Suporte exclusivo, dashboard e recursos sob demanda.</p>
            <Button variant="outline" className="w-full" asChild>
              <a href={commerceWhatsapp} target="_blank" rel="noreferrer">
                Falar no WhatsApp
              </a>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/pricing">Comparar planos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

