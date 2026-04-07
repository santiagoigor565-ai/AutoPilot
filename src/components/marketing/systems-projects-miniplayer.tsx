"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

type SystemsProjectItem = {
  title: string;
  href: string;
  previewScale: number;
  description: string;
};

type SystemsProjectsMiniPlayerProps = {
  projects: SystemsProjectItem[];
};

export function SystemsProjectsMiniPlayer({ projects }: SystemsProjectsMiniPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = projects.length;
  const activeProject = useMemo(() => projects[activeIndex] ?? projects[0], [activeIndex, projects]);

  if (!activeProject) {
    return null;
  }

  function goNext() {
    setActiveIndex((previous) => (previous + 1) % total);
  }

  function goPrevious() {
    setActiveIndex((previous) => (previous - 1 + total) % total);
  }

  return (
    <div className="mt-6">
      <div className="relative">
        <button
          type="button"
          onClick={goPrevious}
          aria-label="Projeto anterior"
          className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-[#95b7df] bg-[#f8fbff] p-2 text-[#1f4f83] shadow-[0_10px_20px_rgb(15_47_86_/_16%)] transition hover:bg-[#e8f2ff] lg:inline-flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="overflow-hidden rounded-2xl border border-[#b8d2f1] bg-[#f8fbff]">
          <div className="flex items-center justify-between border-b border-[#c6dbf4] bg-[#eef5ff] px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f6c453]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#2ccf84]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#4f74a1]">
              {activeProject.title} ({activeIndex + 1}/{total})
            </span>
          </div>

          <div className="relative h-[500px] w-full overflow-hidden bg-[#e9f3ff]">
            <iframe
              src={activeProject.href}
              title={`Visualização ${activeProject.title}`}
              className="pointer-events-none absolute left-0 top-0 border-0 bg-[#ffffff]"
              style={{
                width: `${(100 / activeProject.previewScale).toFixed(3)}%`,
                height: `${(500 / activeProject.previewScale).toFixed(3)}px`,
                transform: `scale(${activeProject.previewScale})`,
                transformOrigin: "top left",
              }}
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox=""
              tabIndex={-1}
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_72%,rgba(11,36,66,0.08)_100%)]" />
          </div>

          <div className="flex flex-col gap-3 border-t border-[#c6dbf4] px-4 py-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[#4d719d]">{activeProject.description}</p>
            <a
              href={activeProject.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#006fdc] hover:underline"
            >
              Abrir site completo
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Próximo projeto"
          className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-[#95b7df] bg-[#f8fbff] p-2 text-[#1f4f83] shadow-[0_10px_20px_rgb(15_47_86_/_16%)] transition hover:bg-[#e8f2ff] lg:inline-flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={goPrevious}
          className="inline-flex items-center gap-1 rounded-full border border-[#9ebee4] bg-[#f8fbff] px-3 py-1.5 text-xs font-semibold text-[#2f5d95] hover:bg-[#e7f1ff]"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>
        <button
          type="button"
          onClick={goNext}
          className="inline-flex items-center gap-1 rounded-full border border-[#9ebee4] bg-[#f8fbff] px-3 py-1.5 text-xs font-semibold text-[#2f5d95] hover:bg-[#e7f1ff]"
        >
          Próximo
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
