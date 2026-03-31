"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildWhatsappHref } from "@/lib/contact";
import { projectOffers } from "@/lib/project-offers";

type ProjectSwitchProps = {
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

export function ProjectSwitch({ className }: ProjectSwitchProps) {
  const initialSlug = projectOffers[0]?.slug ?? "";
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [displaySlug, setDisplaySlug] = useState(initialSlug);
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "out" | "in">("idle");
  const [trafficBudget, setTrafficBudget] = useState(3000);
  const outTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeProject = useMemo(() => {
    return projectOffers.find((item) => item.slug === displaySlug) ?? projectOffers[0];
  }, [displaySlug]);

  const trafficRetentionValue = Math.round(trafficBudget * TRAFFIC_RETENTION_RATE);
  const trafficMediaValue = Math.max(trafficBudget - trafficRetentionValue, 0);
  const trafficTotalMonthly = TRAFFIC_MONTHLY_BASE + trafficBudget;

  const isTrafficProject = activeProject.slug === "gestao-trafego-ia";
  const isSystemsProject = activeProject.slug === "sistemas-automacao-interna";
  const isLandingProject = activeProject.slug === "landing-pages-conexoes";

  useEffect(() => {
    return () => {
      if (outTimeoutRef.current) clearTimeout(outTimeoutRef.current);
      if (inTimeoutRef.current) clearTimeout(inTimeoutRef.current);
    };
  }, []);

  function handleSelect(slug: string) {
    setActiveSlug(slug);
    if (slug === displaySlug) return;

    if (outTimeoutRef.current) clearTimeout(outTimeoutRef.current);
    if (inTimeoutRef.current) clearTimeout(inTimeoutRef.current);

    setTransitionPhase("out");
    outTimeoutRef.current = setTimeout(() => {
      setDisplaySlug(slug);
      setTransitionPhase("in");
      inTimeoutRef.current = setTimeout(() => {
        setTransitionPhase("idle");
      }, 220);
    }, 140);
  }

  if (!activeProject) {
    return null;
  }

  const whatsappHref = buildWhatsappHref(activeProject.whatsappMessage);

  return (
    <div className={cn("rounded-2xl border-0 bg-transparent p-0 shadow-none", className)}>
      <div className="flex justify-center">
        <div className="inline-flex rounded-full bg-[#edf5ff] p-1.5">
          {projectOffers.map((offer) => (
            <button
              key={offer.slug}
              type="button"
              onClick={() => handleSelect(offer.slug)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                activeSlug === offer.slug ? "bg-[#0f2f56] text-[#edf6ff]" : "text-[#2f5c90] hover:bg-[#deebff]",
              )}
            >
              {offer.switchLabel}
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "project-switch-panel mt-6 grid gap-6 lg:grid-cols-[1.12fr_0.88fr]",
          transitionPhase === "out" && "is-fade-out",
          transitionPhase === "in" && "is-fade-in",
        )}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0077ff]">{activeProject.keyword}</p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight text-[#0f2748] md:text-3xl">{activeProject.title}</h3>
          <p className="mt-2 text-base text-[#3f648f]">{activeProject.subtitle}</p>
          <p className="mt-4 text-sm leading-relaxed text-[#4d719d]">{activeProject.overview}</p>

          <ul className="mt-5 space-y-2">
            {activeProject.scopeItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-[#416792]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#19A85E]" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0077ff]">Exemplos</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {activeProject.references.map((reference) => (
                <a
                  key={reference.href}
                  href={reference.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-[#8fb5e5] bg-[#f8fbff] px-4 py-2 text-sm font-semibold text-[#2b5688] hover:bg-[#e4efff]"
                >
                  {reference.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          <Link href={`/projetos/${activeProject.slug}`} className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-[#006fdc] hover:underline">
            Ver pricing detalhado
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <aside className="rounded-2xl border border-[#0b3f7a]/18 bg-[#f4f9ff] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0077ff]">Pricing</p>

          {isTrafficProject ? (
            <>
              <p className="mt-2 text-2xl font-bold text-[#103255]">R$ 1.500/mês + impulsionamento</p>
              <p className="mt-1 text-sm text-[#4d719d]">Selecione a verba mensal de tráfego para calcular o total.</p>

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
              <p className="mt-2 text-2xl font-bold text-[#103255]">Valor sob avaliação técnica</p>
              <p className="mt-1 text-sm text-[#4d719d]">Fazemos uma call para entender a demanda e montar o orçamento ideal.</p>

              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2 text-sm text-[#416792]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#19A85E]" />
                  Diagnóstico funcional e técnico antes da proposta.
                </li>
                <li className="flex items-start gap-2 text-sm text-[#416792]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#19A85E]" />
                  Escopo, cronograma e investimento alinhados na call.
                </li>
                <li className="flex items-start gap-2 text-sm text-[#416792]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#19A85E]" />
                  Proposta pode ser fechada por projeto completo ou por fases.
                </li>
              </ul>
            </>
          ) : null}

          {isLandingProject ? (
            <>
              <p className="mt-2 text-2xl font-bold text-[#103255]">Planos de LandingPage</p>
              <p className="mt-1 text-sm text-[#4d719d]">A manutenção mensal varia conforme a complexidade funcional do projeto.</p>

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
              <p className="mt-2 text-2xl font-bold text-[#103255]">{activeProject.pricing.headline}</p>
              <p className="mt-1 text-sm text-[#4d719d]">{activeProject.pricing.model}</p>

              <ul className="mt-4 space-y-2">
                {activeProject.pricing.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2 text-sm text-[#416792]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#19A85E]" />
                    {detail}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <Button asChild className="mt-5 w-full rounded-full bg-[#19A85E] text-[#f4fff8] hover:bg-[#14884b]">
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              {isSystemsProject ? "Falar com especialista" : "Quero este projeto"}
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </aside>
      </div>
    </div>
  );
}
