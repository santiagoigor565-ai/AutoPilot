import type { SubscriptionStatus } from "@prisma/client";

export type BillingSnapshot = {
  workspaceId: string;
  status: SubscriptionStatus;
  planCode: string;
  providerSubscriptionId?: string | null;
  currentPeriodEnd?: Date | null;
};

export type PublishAllowance = {
  allowed: boolean;
  status: SubscriptionStatus;
  reason?: string;
};

export interface BillingProvider {
  readonly providerName: string;
  getWorkspaceSubscription(workspaceId: string): Promise<BillingSnapshot>;
  canPublish(workspaceId: string): Promise<PublishAllowance>;
  syncWebhook?(payload: unknown): Promise<void>;
}
