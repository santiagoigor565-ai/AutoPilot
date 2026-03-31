import { env } from "@/lib/env";
import { MockBillingProvider } from "@/lib/billing/mock-billing-provider";
import { AsaasBillingProvider } from "@/lib/billing/asaas-billing-provider";
import { MercadoPagoBillingProvider } from "@/lib/billing/mercadopago-billing-provider";
import type { BillingProvider } from "@/lib/billing/provider";

let providerInstance: BillingProvider | null = null;

export function getBillingProvider(): BillingProvider {
  if (providerInstance) {
    return providerInstance;
  }

  if (env.BILLING_PROVIDER === "mercadopago") {
    providerInstance = new MercadoPagoBillingProvider();
  } else if (env.BILLING_PROVIDER === "asaas") {
    providerInstance = new AsaasBillingProvider();
  } else {
    providerInstance = new MockBillingProvider();
  }

  return providerInstance;
}
