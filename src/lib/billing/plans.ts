export type BillingPlanCode = "basic" | "pleno" | "commerce";
export type BillingCycle = "monthly" | "annual";

export type PlanCatalogEntry = {
  code: BillingPlanCode;
  name: string;
  monthlyPriceCents?: number;
  annualPriceCents?: number;
  description: string;
  featureHighlights: string[];
};

export const billingPlanCatalog: Record<BillingPlanCode, PlanCatalogEntry> = {
  basic: {
    code: "basic",
    name: "Basic",
    monthlyPriceCents: 4900,
    annualPriceCents: 50000,
    description: "Criação e manutenção de landing page simples.",
    featureHighlights: ["Landing page simples", "Criação e manutenção", "Suporte padrão"],
  },
  pleno: {
    code: "pleno",
    name: "Pleno",
    monthlyPriceCents: 9700,
    annualPriceCents: 100000,
    description: "Landing completa com WhatsApp, dashboard exclusivo e cobranças.",
    featureHighlights: ["Landing page completa", "Integração com WhatsApp", "Dashboard e cobranças"],
  },
  commerce: {
    code: "commerce",
    name: "Commerce",
    description: "Plano personalizado com suporte exclusivo e funcionalidades sob demanda.",
    featureHighlights: ["Suporte exclusivo", "Escopo sob demanda", "Equipe dedicada"],
  },
};

export function formatCurrencyFromCents(valueCents: number) {
  return (valueCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

