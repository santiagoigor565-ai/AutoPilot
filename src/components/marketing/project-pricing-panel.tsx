"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsappHref } from "@/lib/contact";
import type { ProjectOffer } from "@/lib/project-offers";
import { cn } from "@/lib/utils";

type ProjectPricingPanelProps = {
  offer: ProjectOffer;
  className?: string;
};

const TRAFFIC_MONTHLY_BASE = 1500;
const TRAFFIC_BUDGET_MIN = 100;
const TRAFFIC_BUDGET_MAX = 10000;
const TRAFFIC_BUDGET_STEP = 100;
const TRAFFIC_RETENTION_RATE = 0.1;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function ProjectPricingPanel({ offer, className }: ProjectPricingPanelProps) {
  const [trafficBudget, setTrafficBudget] = useState(3000);

  const isTrafficProject = offer.slug === "gestao-trafego-ia";
  const isSystemsProject = offer.slug === "sistemas-automacao-interna";
  const isLandingProject = offer.slug === "landing-pages-conexoes";

  const trafficRetentionValue = Math.round(trafficBudget * TRAFFIC_RETENTION_RATE);
  const trafficMediaValue = Math.max(trafficBudget - trafficRetentionValue, 0);
  const trafficTotalMonthly = TRAFFIC_MONTHLY_BASE + trafficBudget;
  const whatsappHref = buildWhatsappHref(offer.whatsappMessage);

  return (
    <aside className={cn("surface-card p-7 lg:sticky lg:top-24", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0077ff]">Pricing</p>

      {isTrafficProject ? (
        <>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#102a4a]">R$ 1.500/mês + impulsionamento</p>
          <p className="mt-2 text-sm text-[#4d719d]">Selecione a verba mensal de tráfego para calcular o total.</p>

          <div className="mt-4 rounded-2xl bg-[#f8fbff] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#1d4f85]">Impulsionamento/mês</p>
              <p className="text-base font-bold text-[#103255]">{formatCurrency(trafficBudget)}</p>
            </div>
            <input
              type="range"
              min={TRAFFIC_BUDGET_MIN}
              max={TRAFFIC_BUDGET_MAX}
              step={TRAFFIC_BUDGET_STEP}
              value={trafficBudget}
              onChange={(event) => setTrafficBudget(Number(event.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#d6e6fb] accent-[#0077ff]"
              aria-label="Selecionar valor de impulsionamento mensal"
            />
            <div className="mt-2 flex items-center justify-between text-xs font-medium text-[#5d7fa9]">
              <span>{formatCurrency(TRAFFIC_BUDGET_MIN)}</span>
              <span>{formatCurrency(TRAFFIC_BUDGET_MAX)}</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#bfd6f5] bg-[#eaf3ff] p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4f74a1]">Mensalidade fixa</p>
                <p className="mt-1 text-xl font-bold text-[#103255]">{formatCurrency(TRAFFIC_MONTHLY_BASE)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4f74a1]">Retenção AutoPilot (10%)</p>
                <p className="mt-1 text-xl font-bold text-[#103255]">{formatCurrency(trafficRetentionValue)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4f74a1]">Verba líquida de mídia</p>
                <p className="mt-1 text-xl font-bold text-[#103255]">{formatCurrency(trafficMediaValue)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4f74a1]">Total mensal a pagar</p>
                <p className="mt-1 text-xl font-bold text-[#0b3f7a]">{formatCurrency(trafficTotalMonthly)}</p>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {isSystemsProject ? (
        <>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#102a4a]">Valor sob avaliação técnica</p>
          <p className="mt-2 text-sm text-[#4d719d]">Fazemos uma call para entender a demanda e montar o orçamento ideal.</p>

          <ul className="mt-5 space-y-2">
            <li className="flex items-start gap-2 text-sm leading-relaxed text-[#416792]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#19A85E]" />
              Diagnóstico funcional e técnico antes da proposta.
            </li>
            <li className="flex items-start gap-2 text-sm leading-relaxed text-[#416792]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#19A85E]" />
              Escopo, cronograma e investimento alinhados na call.
            </li>
            <li className="flex items-start gap-2 text-sm leading-relaxed text-[#416792]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#19A85E]" />
              Proposta pode ser fechada por projeto completo ou por fases.
            </li>
          </ul>
        </>
      ) : null}

      {isLandingProject ? (
        <>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#102a4a]">Planos de LandingPage</p>
          <p className="mt-2 text-sm text-[#4d719d]">A manutenção mensal varia conforme a complexidade funcional do projeto.</p>

          <div className="mt-4 rounded-xl border border-[#bfd6f5] bg-[#f8fbff] px-4 py-3">
            <p className="text-sm font-semibold text-[#173f6e]">Site simples com links externos</p>
            <p className="mt-1 text-xs text-[#567aa6]">Estrutura inicial com canais conectados para conversão rápida.</p>
          </div>

          <div className="mt-4 rounded-2xl border border-[#bfd6f5] bg-[#eaf3ff] p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4f74a1]">Primeiro mês</p>
                <p className="mt-1 text-xl font-bold text-[#103255]">{formatCurrency(150)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4f74a1]">Mensal recorrente</p>
                <p className="mt-1 text-xl font-bold text-[#103255]">{formatCurrency(150)}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#5478a2]">
              Conexão com APIs externas, agenda e sistema interno é tratada mediante avaliação técnica.
            </p>
          </div>
        </>
      ) : null}

      {!isTrafficProject && !isSystemsProject && !isLandingProject ? (
        <>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#102a4a]">{offer.pricing.headline}</p>
          <p className="mt-2 text-sm text-[#4d719d]">{offer.pricing.model}</p>

          <ul className="mt-5 space-y-2">
            {offer.pricing.details.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-[#416792]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#19A85E]" />
                {item}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <Button asChild className="mt-6 w-full rounded-full bg-[#19A85E] text-[#f4fff8] hover:bg-[#14884b]">
        <a href={whatsappHref} target="_blank" rel="noreferrer">
          {isSystemsProject ? "Falar com especialista" : "Solicitar proposta deste projeto"}
          <ArrowRight className="h-4 w-4" />
        </a>
      </Button>
    </aside>
  );
}
