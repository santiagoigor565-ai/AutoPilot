import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { FloatingWhatsappButton } from "@/components/marketing/floating-whatsapp-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { billingPlanCatalog, formatCurrencyFromCents } from "@/lib/billing/plans";
import { buildPlanFallbackWhatsapp, resolveAsaasCheckoutLink } from "@/lib/billing/checkout-links";

type PlanFeature = {
  label: string;
};

type PlanCta = {
  href: string;
  label: string;
};

type Plan = {
  name: string;
  badge?: string;
  subtitle: string;
  monthly?: string;
  annual?: string;
  features: PlanFeature[];
  ctas: PlanCta[];
};

const basicMonthlyHref = resolveAsaasCheckoutLink("basic", "monthly") ?? buildPlanFallbackWhatsapp("basic", "monthly");
const basicAnnualHref = resolveAsaasCheckoutLink("basic", "annual") ?? buildPlanFallbackWhatsapp("basic", "annual");
const plenoMonthlyHref = resolveAsaasCheckoutLink("pleno", "monthly") ?? buildPlanFallbackWhatsapp("pleno", "monthly");
const plenoAnnualHref = resolveAsaasCheckoutLink("pleno", "annual") ?? buildPlanFallbackWhatsapp("pleno", "annual");
const commerceHref = resolveAsaasCheckoutLink("commerce", "monthly") ?? buildPlanFallbackWhatsapp("commerce", "monthly");

function isWhatsappUrl(url: string) {
  return url.includes("wa.me/");
}

const plans: Plan[] = [
  {
    name: "Basic",
    subtitle: billingPlanCatalog.basic.description,
    monthly: billingPlanCatalog.basic.monthlyPriceCents ? `${formatCurrencyFromCents(billingPlanCatalog.basic.monthlyPriceCents)}/mês` : undefined,
    annual: billingPlanCatalog.basic.annualPriceCents ? `${formatCurrencyFromCents(billingPlanCatalog.basic.annualPriceCents)}/ano` : undefined,
    features: [
      { label: "Criação de landing page simples" },
      { label: "Manutenção recorrente" },
      { label: "Publicação e hospedagem" },
    ],
    ctas: [
      { href: basicMonthlyHref, label: "Assinar mensal" },
      { href: basicAnnualHref, label: "Assinar anual" },
    ],
  },
  {
    name: "Pleno",
    badge: "Mais escolhido",
    subtitle: billingPlanCatalog.pleno.description,
    monthly: billingPlanCatalog.pleno.monthlyPriceCents ? `${formatCurrencyFromCents(billingPlanCatalog.pleno.monthlyPriceCents)}/mês` : undefined,
    annual: billingPlanCatalog.pleno.annualPriceCents ? `${formatCurrencyFromCents(billingPlanCatalog.pleno.annualPriceCents)}/ano` : undefined,
    features: [
      { label: "Landing completa com WhatsApp" },
      { label: "Dashboard exclusivo" },
      { label: "Módulo de cobranças" },
    ],
    ctas: [
      { href: plenoMonthlyHref, label: "Assinar mensal" },
      { href: plenoAnnualHref, label: "Assinar anual" },
    ],
  },
  {
    name: "Commerce",
    subtitle: billingPlanCatalog.commerce.description,
    features: [
      { label: "Suporte exclusivo" },
      { label: "Landing completa + dashboard + cobranças" },
      { label: "Funcionalidades sob demanda" },
    ],
    ctas: [{ href: commerceHref, label: "Falar no WhatsApp" }],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav mode="pricing" />

      <main className="mx-auto w-full max-w-[1520px] px-2 py-16 md:px-3">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0077ff]">Planos AutoPilot.com</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#102a4a] md:text-5xl">Escolha o plano ideal para acelerar sua presença digital</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#486b98] md:text-base">
            Pagamento via Asaas no ciclo mensal ou anual. Se preferir, finalizamos sua contratação pelo WhatsApp.
          </p>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className="surface-card border-[#0b3f7a]/14 bg-[#f9fcff]/90 shadow-[0_18px_40px_rgb(11_41_82_/_12%)]">
              <CardContent className="flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-2xl font-semibold text-[#133760]">{plan.name}</p>
                  {plan.badge ? <span className="rounded-md bg-[#0077ff]/12 px-2 py-1 text-xs font-semibold text-[#005ec9]">{plan.badge}</span> : null}
                </div>

                <div className="mt-8 space-y-1">
                  <p className="text-3xl font-semibold tracking-tight text-[#0f2d52]">{plan.monthly ?? "Personalizado"}</p>
                  {plan.annual ? <p className="text-sm font-medium text-[#5578a5]">{plan.annual}</p> : null}
                </div>

                <div className="my-6 h-px w-full bg-[#d4e3f8]" />

                <p className="text-sm text-[#4e719d]">{plan.subtitle}</p>

                <ul className="mt-5 space-y-3 text-base text-[#2f5c90]">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#d9ebff] text-[#0a63d2]">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span>{feature.label}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 space-y-2">
                  {plan.ctas.map((cta, index) => (
                    <Button
                      key={cta.label}
                      asChild
                      className={(() => {
                        const isWhatsappDirect = isWhatsappUrl(cta.href);
                        if (isWhatsappDirect) {
                          return "w-full rounded-xl bg-[#19A85E] text-[#f4fff8] hover:bg-[#14884b]";
                        }

                        return index === 0
                          ? "w-full rounded-xl bg-[linear-gradient(180deg,#2b8cff,#0067e6)] text-[#eef6ff] hover:bg-[linear-gradient(180deg,#2394ff,#005fd3)]"
                          : "w-full rounded-xl border border-[#8eb6e7] bg-transparent text-[#1d4675] hover:bg-[#e4efff]";
                      })()}
                      variant={isWhatsappUrl(cta.href) || index === 0 ? "default" : "outline"}
                    >
                      <Link href={cta.href} target="_blank" rel="noreferrer">
                        {cta.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[#b9d3f4] bg-[#eff6ff]/85 p-6 text-center">
          <p className="text-sm text-[#486b98]">
            Precisa de orientação para escolher o plano? Nossa equipe responde rápido e indica o melhor cenário para seu momento.
          </p>
          <Button
            asChild
            variant={isWhatsappUrl(commerceHref) ? "default" : "outline"}
            className={
              isWhatsappUrl(commerceHref)
                ? "mt-4 rounded-full bg-[#19A85E] text-[#f4fff8] hover:bg-[#14884b]"
                : "mt-4 rounded-full border-[#85afe3] bg-transparent text-[#1d4675] hover:bg-[#e4efff]"
            }
          >
            <Link href={commerceHref} target="_blank" rel="noreferrer">
              Falar com especialista
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>

      <MarketingFooter />
      <FloatingWhatsappButton message="Oi! Quero ajuda para escolher o melhor plano da AutoPilot." />
    </div>
  );
}
