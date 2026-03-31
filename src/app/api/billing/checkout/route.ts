import { BillingProviderKind, SubscriptionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { BillingCycle, BillingPlanCode } from "@/lib/billing/plans";
import { buildPlanFallbackWhatsapp, resolveAsaasCheckoutLink } from "@/lib/billing/checkout-links";
import { env } from "@/lib/env";
import { db } from "@/lib/prisma";
import { getApiUser } from "@/lib/server/api-auth";
import { assertWorkspaceAccess } from "@/lib/server/services/page-service";

const bodySchema = z.object({
  workspaceId: z.string().min(10),
  planCode: z.enum(["basic", "pleno", "commerce"]),
  cycle: z.enum(["monthly", "annual"]),
});

function resolveProviderKind() {
  if (env.BILLING_PROVIDER === "asaas") return BillingProviderKind.asaas;
  if (env.BILLING_PROVIDER === "mercadopago") return BillingProviderKind.mercadopago;
  return BillingProviderKind.mock;
}

function resolveCheckout(planCode: BillingPlanCode, cycle: BillingCycle) {
  const asaasLink = resolveAsaasCheckoutLink(planCode, cycle);
  if (asaasLink) {
    return { checkoutUrl: asaasLink, source: "asaas-link" as const };
  }

  return { checkoutUrl: buildPlanFallbackWhatsapp(planCode, cycle), source: "whatsapp-fallback" as const };
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  const { workspaceId, planCode, cycle } = parsed.data;
  await assertWorkspaceAccess(user.id, workspaceId, "admin");

  const checkout = resolveCheckout(planCode, cycle);

  await db.subscription.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      provider: resolveProviderKind(),
      status: SubscriptionStatus.trial,
      planCode,
      metadata: {
        selectedPlan: planCode,
        selectedCycle: cycle,
        checkoutSource: checkout.source,
      },
    },
    update: {
      provider: resolveProviderKind(),
      planCode,
      metadata: {
        selectedPlan: planCode,
        selectedCycle: cycle,
        checkoutSource: checkout.source,
      },
    },
  });

  return NextResponse.json({
    checkoutUrl: checkout.checkoutUrl,
    checkoutSource: checkout.source,
    provider: env.BILLING_PROVIDER,
  });
}
