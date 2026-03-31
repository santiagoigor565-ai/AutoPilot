import type { BillingCycle, BillingPlanCode } from "@/lib/billing/plans";
import { env } from "@/lib/env";
import { buildWhatsappHref } from "@/lib/contact";

type CheckoutLinkMap = Record<BillingPlanCode, Partial<Record<BillingCycle, string>> & { custom?: string }>;

const asaasCheckoutLinks: CheckoutLinkMap = {
  basic: {
    monthly: env.ASAAS_BASIC_MONTHLY_CHECKOUT_URL,
    annual: env.ASAAS_BASIC_ANNUAL_CHECKOUT_URL,
  },
  pleno: {
    monthly: env.ASAAS_PLENO_MONTHLY_CHECKOUT_URL,
    annual: env.ASAAS_PLENO_ANNUAL_CHECKOUT_URL,
  },
  commerce: {
    custom: env.ASAAS_COMMERCE_CHECKOUT_URL,
  },
};

export function resolveAsaasCheckoutLink(planCode: BillingPlanCode, cycle: BillingCycle) {
  if (planCode === "commerce") {
    return asaasCheckoutLinks.commerce.custom ?? null;
  }

  return asaasCheckoutLinks[planCode][cycle] ?? null;
}

export function buildPlanFallbackWhatsapp(planCode: BillingPlanCode, cycle: BillingCycle) {
  const planLabel = planCode === "basic" ? "Basic" : planCode === "pleno" ? "Pleno" : "Commerce";
  const cycleLabel = cycle === "annual" ? "anual" : "mensal";

  return buildWhatsappHref(`Oi! Quero assinar o plano ${planLabel} (${cycleLabel}).`);
}
