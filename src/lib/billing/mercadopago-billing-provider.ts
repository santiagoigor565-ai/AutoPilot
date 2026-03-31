import type { BillingProvider, BillingSnapshot, PublishAllowance } from "@/lib/billing/provider";

export class MercadoPagoBillingProvider implements BillingProvider {
  readonly providerName = "mercadopago";

  async getWorkspaceSubscription(workspaceId: string): Promise<BillingSnapshot> {
    void workspaceId;
    throw new Error("MercadoPagoBillingProvider ainda nao implementado.");
  }

  async canPublish(workspaceId: string): Promise<PublishAllowance> {
    void workspaceId;
    throw new Error("MercadoPagoBillingProvider ainda nao implementado.");
  }

  async syncWebhook(payload: unknown): Promise<void> {
    void payload;
    throw new Error("Webhook MercadoPago ainda nao implementado.");
  }
}
