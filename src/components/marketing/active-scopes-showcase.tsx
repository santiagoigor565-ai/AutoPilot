"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { buildWhatsappHref } from "@/lib/contact";
import { cn } from "@/lib/utils";

type ActiveScopesShowcaseProps = {
  className?: string;
  style?: CSSProperties;
};

type ScopeItem = {
  label: string;
  title: string;
  summary: string;
  pricing: string;
  details: string;
  highlights: string[];
  whatsappMessage: string;
};

const ROTATION_MS = 10_000;
const ROTATION_SECONDS = Math.floor(ROTATION_MS / 1000);
const MAX_TILT = 7;
const CONTENT_FADE_OUT_MS = 140;
const CONTENT_FADE_IN_MS = 220;

const scopeItems: ScopeItem[] = [
  {
    label: "Tráfego + IA",
    title: "Gestão de trágo inteligente",
    summary: "Atraímos demanda com mídia paga e conectamos o fluxo comercial ao AutoWhats para acelerar conversão.",
    pricing: "R$ 1.500/mês + impulsionamento",
    details: "Verba de mídia definida com o cliente, com gestão técnica contínua.",
    highlights: ["Campanhas com foco em venda", "IA dedicada no atendimento", "Acompanhamento mensal de performance"],
    whatsappMessage: "Oi! Quero falar sobre o escopo de Tráfego + IA.",
  },
  {
    label: "Sistemas",
    title: "Software sob medida para operação PJ",
    summary: "Projetamos sistemas internos e automações conforme regras do seu negócio e nível de complexidade.",
    pricing: "Precificação sob demanda",
    details: "Escopo e orçamento definidos após diagnóstico técnico em call.",
    highlights: ["Levantamento funcional", "Arquitetura personalizada", "Entrega por fases com validação"],
    whatsappMessage: "Oi! Quero agendar uma call para precificar um sistema sob medida.",
  },
  {
    label: "LandingPage",
    title: "Landing pages com conexões externas",
    summary: "Publicamos estrutura comercial com WhatsApp, e-mail e integrações essenciais para aquisição rápida.",
    pricing: "A partir de R$ 150/mês",
    details: "Ajustes e manutenção contínua, com evolução por complexidade.",
    highlights: ["Site inicial rápido", "Conexões externas", "Ciclo de melhoria recorrente"],
    whatsappMessage: "Oi! Quero detalhar uma LandingPage com conexões externas.",
  },
];

function formatRemaining(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  return `00:${String(safeSeconds).padStart(2, "0")}`;
}

export function ActiveScopesShowcase({ className, style }: ActiveScopesShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(ROTATION_SECONDS);
  const [isHovering, setIsHovering] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "out" | "in">("idle");
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const tiltTargetRef = useRef({ x: 0, y: 0 });
  const tiltAnimationRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);
  const displayIndexRef = useRef(0);
  const outTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeScope = scopeItems[displayIndex] ?? scopeItems[0];
  const progress = useMemo(() => ((ROTATION_SECONDS - remainingSeconds) / ROTATION_SECONDS) * 100, [remainingSeconds]);
  const whatsappHref = buildWhatsappHref(activeScope.whatsappMessage);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    displayIndexRef.current = displayIndex;
  }, [displayIndex]);

  useEffect(() => {
    return () => {
      if (outTimeoutRef.current) clearTimeout(outTimeoutRef.current);
      if (inTimeoutRef.current) clearTimeout(inTimeoutRef.current);
      if (tiltAnimationRef.current !== null) {
        window.cancelAnimationFrame(tiltAnimationRef.current);
      }
    };
  }, []);

  function switchScope(index: number, resetTimer = true) {
    setActiveIndex(index);
    if (resetTimer) {
      setRemainingSeconds(ROTATION_SECONDS);
    }

    if (index === displayIndexRef.current) return;

    if (outTimeoutRef.current) clearTimeout(outTimeoutRef.current);
    if (inTimeoutRef.current) clearTimeout(inTimeoutRef.current);

    setTransitionPhase("out");
    outTimeoutRef.current = setTimeout(() => {
      setDisplayIndex(index);
      displayIndexRef.current = index;
      setTransitionPhase("in");

      inTimeoutRef.current = setTimeout(() => {
        setTransitionPhase("idle");
      }, CONTENT_FADE_IN_MS);
    }, CONTENT_FADE_OUT_MS);
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          const next = (activeIndexRef.current + 1) % scopeItems.length;
          switchScope(next, false);
          return ROTATION_SECONDS;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  function applyTilt() {
    tiltAnimationRef.current = null;
    if (!tiltRef.current) return;

    const rotateY = tiltTargetRef.current.x;
    const rotateX = tiltTargetRef.current.y;
    const shadowBlur = 24;

    tiltRef.current.style.transform = `perspective(1400px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    tiltRef.current.style.boxShadow = `${(-rotateY * 1.4).toFixed(2)}px ${(rotateX * 1.4).toFixed(2)}px ${shadowBlur.toFixed(2)}px rgba(12, 41, 78, 0.14)`;
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const xPercent = (event.clientX - rect.left) / rect.width - 0.5;
    const yPercent = (event.clientY - rect.top) / rect.height - 0.5;

    tiltTargetRef.current.x = xPercent * MAX_TILT;
    tiltTargetRef.current.y = -yPercent * MAX_TILT;

    if (tiltAnimationRef.current === null) {
      tiltAnimationRef.current = window.requestAnimationFrame(applyTilt);
    }
  }

  function handleMouseLeave() {
    if (tiltAnimationRef.current !== null) {
      window.cancelAnimationFrame(tiltAnimationRef.current);
      tiltAnimationRef.current = null;
    }

    tiltTargetRef.current.x = 0;
    tiltTargetRef.current.y = 0;

    if (tiltRef.current) {
      tiltRef.current.style.transform = "perspective(1400px) rotateX(0deg) rotateY(0deg)";
      tiltRef.current.style.boxShadow = "0 14px 34px rgba(12, 41, 78, 0.1)";
    }

    setIsHovering(false);
  }

  function handleMouseEnter() {
    setIsHovering(true);
  }

  function handleSelect(index: number) {
    switchScope(index, true);
  }

  return (
    <article className={cn("reveal relative", className)} style={style}>
      <div
        ref={tiltRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex min-h-[620px] flex-col rounded-2xl border border-[#b9d2ef] bg-[#f4f9ff]/70 p-5 transition-[transform,box-shadow] duration-200 ease-out will-change-transform"
        style={{ transform: "perspective(1400px) rotateX(0deg) rotateY(0deg)", boxShadow: "0 14px 34px rgba(12, 41, 78, 0.1)" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_20%_18%,rgb(255_255_255_/_52%),transparent_42%),radial-gradient(circle_at_82%_84%,rgb(120_193_255_/_16%),transparent_38%)] transition-opacity duration-400 ease-out"
          style={{ opacity: isHovering ? 1 : 0 }}
        />
        <div
          className={cn(
            "scope-switch-content relative z-10 flex min-h-full flex-col",
            transitionPhase === "out" && "is-fade-out",
            transitionPhase === "in" && "is-fade-in",
          )}
        >
          <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#ffb454]/45 bg-[#fff5e6] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#8b4f00]">
            <Sparkles className="h-3.5 w-3.5" />
            Escopos ativos
          </p>
          <p className="text-xs font-semibold tracking-[0.1em] text-[#8aa5c8]">Troca em {formatRemaining(remainingSeconds)}</p>
          </div>

          <h2 className="mt-5 truncate text-3xl font-semibold leading-tight text-[#0f2947]" title={activeScope.title}>
            {activeScope.title}
          </h2>
          <p
            className="mt-3 min-h-[56px] text-sm leading-relaxed text-[#3f628e]"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
            title={activeScope.summary}
          >
            {activeScope.summary}
          </p>

          <div className="relative mt-5 min-h-[156px] rounded-2xl border border-[#0b3f7a]/18 bg-[#0b2442] p-5 text-[#eaf4ff]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8bc4ff]">Pricing</p>
            <p className="mt-1 truncate text-3xl font-bold" title={activeScope.pricing}>
              {activeScope.pricing}
            </p>
            <p
              className="mt-2 text-sm text-[#c5defb]"
              style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
              title={activeScope.details}
            >
              {activeScope.details}
            </p>
          </div>

          <ul className="mt-4 grid min-h-[90px] grid-rows-3 gap-2">
            {activeScope.highlights.map((item) => (
              <li key={item} className="truncate text-sm text-[#3f648f]" title={item}>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-5 grid min-h-[42px] grid-cols-3 gap-2">
            {scopeItems.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSelect(index)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-xs font-semibold transition",
                    isActive ? "border-[#0c3d72] bg-[#0f2f56] text-[#eaf4ff]" : "border-[#b7cde9] bg-[#edf5ff] text-[#35618f] hover:bg-[#e3efff]",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#dbe8f8]">
            <div className="h-full rounded-full bg-[#87b8f1]/80 transition-[width] duration-100" style={{ width: `${progress}%` }} />
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#006fdc] underline-offset-4 hover:underline"
          >
            Solicitar proposta personalizada
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
