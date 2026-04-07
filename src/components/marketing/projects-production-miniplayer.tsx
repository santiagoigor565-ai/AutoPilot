"use client";

import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export type ProductionProjectPreview = {
  name: string;
  href: string;
  previewImageSrc: string;
  previewWidth: number;
  previewHeight: number;
};

type ProjectsProductionMiniPlayerProps = {
  projects: ProductionProjectPreview[];
};

export function ProjectsProductionMiniPlayer({ projects }: ProjectsProductionMiniPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = projects.length;
  const activeProject = useMemo(() => projects[activeIndex] ?? projects[0], [activeIndex, projects]);

  if (!activeProject || total === 0) return null;

  function goPrev() {
    setActiveIndex((previous) => (previous - 1 + total) % total);
  }

  function goNext() {
    setActiveIndex((previous) => (previous + 1) % total);
  }

  return (
    <div className="mt-8">
      <div className="relative">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Projeto anterior"
          className="absolute left-2 top-1/2 z-20 inline-flex -translate-y-1/2 rounded-full border border-[#95b7df] bg-[#f8fbff] p-2 text-[#1f4f83] shadow-[0_10px_20px_rgb(15_47_86_/_16%)] transition hover:bg-[#e8f2ff]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <article className="surface-card overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-[#c6dbf4] bg-[#eef5ff] px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f6c453]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#2ccf84]" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#4f74a1]">
              {activeProject.name} ({activeIndex + 1}/{total})
            </p>
          </div>

          <div className="relative h-[540px] w-full overflow-y-auto overscroll-contain bg-[#e9f3ff]">
            <Image
              key={activeProject.previewImageSrc}
              src={activeProject.previewImageSrc}
              alt={`Preview do projeto ${activeProject.name}`}
              width={activeProject.previewWidth}
              height={activeProject.previewHeight}
              sizes="(min-width: 1280px) 1200px, (min-width: 768px) 94vw, 100vw"
              className="h-auto w-full select-none"
              priority={activeIndex === 0}
              loading={activeIndex === 0 ? "eager" : "lazy"}
              draggable={false}
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_76%,rgba(11,36,66,0.1)_100%)]" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#c6dbf4] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.11em] text-[#4f74a1]">Role para visualizar a página (modo estático)</p>
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
        </article>

        <button
          type="button"
          onClick={goNext}
          aria-label="Próximo projeto"
          className="absolute right-2 top-1/2 z-20 inline-flex -translate-y-1/2 rounded-full border border-[#95b7df] bg-[#f8fbff] p-2 text-[#1f4f83] shadow-[0_10px_20px_rgb(15_47_86_/_16%)] transition hover:bg-[#e8f2ff]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
