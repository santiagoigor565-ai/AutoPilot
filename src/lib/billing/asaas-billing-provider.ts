import { BillingProviderKind, Prisma, SubscriptionStatus } from "@prisma/client";
import type { BillingProvider, BillingSnapshot, PublishAllowance } from "@/lib/billing/provider";
import { db } from "@/lib/prisma";

const ALLOWED_TO_PUBLISH = new Set<SubscriptionStatus>(["trial", "active"]);

function mapAsaasEventToStatus(eventName: string | null | undefined): SubscriptionStatus | null {
  if (!eventName) return null;

  if (eventName.includes("PAYMENT_RECEIVED") || eventName.includes("PAYMENT_CONFIRMED")) return "active";
  if (eventName.includes("PAYMENT_OVERDUE")) return "past_due";
  if (eventName.includes("PAYMENT_DELETED") || eventName.includes("PAYMENT_REFUNDED")) return "canceled";
  return null;
}

function safeObject(value: unknown) {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function toPrismaJson(value: unknown): Prisma.InputJsonValue | undefined {
  const plain = safeObject(value);
  if (!plain) return undefined;

  return JSON.parse(JSON.stringify(plain)) as Prisma.InputJsonValue;
}

function extractExternalReference(payload: unknown) {
  const event = safeObject(payload);
  if (!event) return null;

  const payment = safeObject(event.payment);
  if (payment && typeof payment.externalReference === "string") {
    return payment.externalReference;
  }

  const subscription = safeObject(event.subscription);
  if (subscription && typeof subscription.externalReference === "string") {
    return subscription.externalReference;
  }

  return null;
}

function extractProviderSubscriptionId(payload: unknown) {
  const event = safeObject(payload);
  if (!event) return null;

  const subscription = safeObject(event.subscription);
  if (subscription && typeof subscription.id === "string") return subscription.id;

  const payment = safeObject(event.payment);
  if (payment && typeof payment.subscription === "string") return payment.subscription;

  return null;
}

function extractEventName(payload: unknown) {
  const event = safeObject(payload);
  if (!event) return null;
  return typeof event.event === "string" ? event.event : null;
}

export class AsaasBillingProvider implements BillingProvider {
  readonly providerName = "asaas";

  async getWorkspaceSubscription(workspaceId: string): Promise<BillingSnapshot> {
    const subscription = await db.subscription.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        provider: BillingProviderKind.asaas,
        status: SubscriptionStatus.trial,
        planCode: "basic",
        trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
      update: {
        provider: BillingProviderKind.asaas,
      },
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
      reason: "Plano inativo. Regularize sua assinatura para publicar.",
    };
  }

  async syncWebhook(payload: unknown): Promise<void> {
    const workspaceId = extractExternalReference(payload);
    const status = mapAsaasEventToStatus(extractEventName(payload));
    if (!workspaceId || !status) {
      return;
    }

    const providerSubscriptionId = extractProviderSubscriptionId(payload);

    await db.subscription.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        provider: BillingProviderKind.asaas,
        status,
        planCode: "basic",
        providerSubscriptionId: providerSubscriptionId ?? undefined,
      },
      update: {
        provider: BillingProviderKind.asaas,
        status,
        providerSubscriptionId: providerSubscriptionId ?? undefined,
        metadata: toPrismaJson(payload),
        canceledAt: status === "canceled" ? new Date() : null,
      },
    });
  }
}
