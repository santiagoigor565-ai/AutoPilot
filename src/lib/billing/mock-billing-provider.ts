import { SubscriptionStatus, BillingProviderKind } from "@prisma/client";
import { db } from "@/lib/prisma";
import type { BillingProvider, BillingSnapshot, PublishAllowance } from "@/lib/billing/provider";

const ALLOWED_TO_PUBLISH = new Set<SubscriptionStatus>(["trial", "active"]);

export class MockBillingProvider implements BillingProvider {
  readonly providerName = "mock";

  async getWorkspaceSubscription(workspaceId: string): Promise<BillingSnapshot> {
    const subscription = await db.subscription.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        provider: BillingProviderKind.mock,
        status: SubscriptionStatus.trial,
        planCode: "basic",
        trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      },
      update: {},
    });

    return {
      workspaceId,
      status: subscription.status,
      planCode: subscription.planCode,
      providerSubscriptionId: subscription.providerSubscriptionId,
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  }

  async canPublish(workspaceId: string): Promise<PublishAllowance> {
    const subscription = await this.getWorkspaceSubscription(workspaceId);
    if (ALLOWED_TO_PUBLISH.has(subscription.status)) {
      return { allowed: true, status: subscription.status };
    }

    return {
      allowed: false,
      status: subscription.status,
      reason: "Plano inativo. Ative ou regularize a assinatura para publicar.",
    };
  }
}
