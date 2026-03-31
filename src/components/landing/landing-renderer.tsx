import Image from "next/image";
import type { LandingContent } from "@/types/builder";
import { LeadCaptureForm } from "@/components/landing/lead-capture-form";

type LandingRendererProps = {
  content: LandingContent;
  pageId: string;
  mode?: "published" | "preview";
};

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

function SectionWrapper({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mx-auto w-full max-w-5xl px-6 py-14 md:py-18">
      {children}
    </section>
  );
}

function normalizeHex(value: string, fallback: string) {
  const cleaned = value.trim().replace("#", "").toUpperCase();
  const source = /^[0-9A-F]{3}([0-9A-F]{3})?$/.test(cleaned)
    ? cleaned.length === 3
      ? cleaned
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : cleaned
    : fallback.replace("#", "");

  return `#${source}`;
}

function hexToRgb(value: string): RgbColor {
  const normalized = value.replace("#", "");
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(color: RgbColor) {
  const channel = (value: number) => Math.round(Math.max(0, Math.min(255, value))).toString(16).padStart(2, "0").toUpperCase();
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
}

function mixHex(base: string, target: string, ratio: number) {
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  const source = hexToRgb(base);
  const end = hexToRgb(target);

  return rgbToHex({
    r: source.r + (end.r - source.r) * clampedRatio,
    g: source.g + (end.g - source.g) * clampedRatio,
    b: source.b + (end.b - source.b) * clampedRatio,
  });
}

function withAlpha(color: string, alpha: number) {
  const rgb = hexToRgb(color);
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampedAlpha})`;
}

function getReadableTextColor(background: string) {
  const { r, g, b } = hexToRgb(background);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.58 ? "#102322" : "#F3FBFA";
}

export function LandingRenderer({ content, pageId, mode = "published" }: LandingRendererProps) {
  const primary = normalizeHex(content.theme.primaryColor, "#324E4B");
  const secondary = normalizeHex(content.theme.secondaryColor, "#5F948E");
  const accent = normalizeHex(content.theme.accentColor, "#87B2AD");
  const background = normalizeHex(content.theme.backgroundColor, "#F7FBFB");
  const foreground = normalizeHex(content.theme.foregroundColor, "#112725");

  const heroBackground = `linear-gradient(135deg, ${mixHex(primary, "#0E1716", 0.34)}, ${mixHex(secondary, "#132422", 0.3)})`;
  const heroText = getReadableTextColor(mixHex(primary, secondary, 0.5));
  const heroMutedText = withAlpha(heroText, 0.82);

  const sectionSurface = mixHex(background, "#FFFFFF", 0.88);
  const sectionSurfaceSoft = mixHex(background, "#FFFFFF", 0.94);
  const borderTone = withAlpha(primary, 0.2);
  const softText = withAlpha(foreground, 0.72);
  const subtleText = withAlpha(foreground, 0.6);

  const accentText = getReadableTextColor(accent);
  const primaryText = getReadableTextColor(primary);

  const themeStyles = {
    "--tenant-primary": primary,
    "--tenant-secondary": secondary,
    "--tenant-accent": accent,
    "--tenant-background": background,
    "--tenant-foreground": foreground,
  } as React.CSSProperties;

  return (
    <div style={themeStyles} className="min-h-screen" >
      {content.sections.map((section) => {
        if (section.type === "hero") {
          const hasHeroImage = Boolean(section.imageUrl);

          return (
            <div key={section.id} style={{ background: heroBackground }}>
              <SectionWrapper>
                <div className={`grid gap-10 ${hasHeroImage ? "md:grid-cols-[minmax(0,1fr)_420px] md:items-center" : ""}`}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
                      {section.eyebrow ?? "Plataforma de alta conversao"}
                    </p>
                    <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl" style={{ color: heroText }}>
                      {section.title}
                    </h1>
                    <p className="mt-4 max-w-2xl text-base" style={{ color: heroMutedText }}>
                      {section.subtitle}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <a
                        className="rounded-md px-4 py-2 text-sm font-medium transition hover:opacity-90"
                        style={{ backgroundColor: accent, color: accentText }}
                        href={section.ctaHref}
                      >
                        {section.ctaLabel}
                      </a>
                      {section.secondaryLabel ? (
                        <a
                          className="rounded-md border px-4 py-2 text-sm transition"
                          style={{ borderColor: withAlpha(heroText, 0.35), color: heroText }}
                          href={section.secondaryHref}
                        >
                          {section.secondaryLabel}
                        </a>
                      ) : null}
                    </div>
                  </div>
                  {hasHeroImage ? (
                    <div className="hidden md:block">
                      <div
                        className="overflow-hidden rounded-3xl border p-3 shadow-2xl"
                        style={{ borderColor: withAlpha(heroText, 0.2), backgroundColor: withAlpha(background, 0.12) }}
                      >
                        <Image
                          src={section.imageUrl!}
                          alt={section.imageAlt ?? section.title}
                          width={860}
                          height={980}
                          className="h-full w-full rounded-[1.25rem] object-cover"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </SectionWrapper>
            </div>
          );
        }

        if (section.type === "logos") {
          return (
            <SectionWrapper key={section.id}>
              <p className="text-center text-sm uppercase tracking-[0.16em]" style={{ color: subtleText }}>
                {section.title}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {section.logos.map((logo) => (
                  <div
                    key={logo}
                    className="rounded-md border px-4 py-3 text-center text-sm font-medium"
                    style={{ borderColor: borderTone, backgroundColor: sectionSurface, color: primary }}
                  >
                    {logo}
                  </div>
                ))}
              </div>
            </SectionWrapper>
          );
        }

        if (section.type === "benefits" || section.type === "features") {
          return (
            <SectionWrapper key={section.id}>
              <h2 className="text-3xl font-semibold" style={{ color: foreground }}>{section.title}</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {section.items.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-xl border p-5 shadow-sm"
                    style={{ borderColor: borderTone, backgroundColor: sectionSurface }}
                  >
                    <h3 className="text-base font-semibold" style={{ color: primary }}>{item.title}</h3>
                    <p className="mt-2 text-sm" style={{ color: softText }}>{item.description}</p>
                  </article>
                ))}
              </div>
            </SectionWrapper>
          );
        }

        if (section.type === "howItWorks") {
          return (
            <SectionWrapper key={section.id} id="como-funciona">
              <h2 className="text-3xl font-semibold" style={{ color: foreground }}>{section.title}</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {section.steps.map((step) => (
                  <article key={step.title} className="rounded-xl border p-5" style={{ borderColor: borderTone, backgroundColor: sectionSurfaceSoft }}>
                    <h3 className="font-semibold" style={{ color: primary }}>{step.title}</h3>
                    <p className="mt-2 text-sm" style={{ color: softText }}>{step.description}</p>
                  </article>
                ))}
              </div>
            </SectionWrapper>
          );
        }

        if (section.type === "testimonials") {
          return (
            <SectionWrapper key={section.id}>
              <h2 className="text-3xl font-semibold" style={{ color: foreground }}>{section.title}</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {section.items.map((item) => (
                  <article key={item.author} className="rounded-xl border p-6" style={{ borderColor: borderTone, backgroundColor: sectionSurface }}>
                    <p className="text-base italic" style={{ color: foreground }}>&ldquo;{item.quote}&rdquo;</p>
                    <p className="mt-4 text-sm font-semibold" style={{ color: primary }}>{item.author}</p>
                    <p className="text-xs" style={{ color: subtleText }}>{item.role}</p>
                  </article>
                ))}
              </div>
            </SectionWrapper>
          );
        }

        if (section.type === "cta") {
          return (
            <SectionWrapper key={section.id}>
              <div
                className="rounded-2xl border p-8"
                style={{
                  borderColor: borderTone,
                  background: `linear-gradient(120deg, ${withAlpha(secondary, 0.2)}, ${withAlpha(primary, 0.14)})`,
                }}
              >
                <h2 className="text-3xl font-semibold" style={{ color: foreground }}>{section.title}</h2>
                <p className="mt-2 text-sm" style={{ color: softText }}>{section.description}</p>
                <a
                  href={section.ctaHref}
                  className="mt-5 inline-flex rounded-md px-4 py-2 text-sm font-medium transition hover:opacity-90"
                  style={{ backgroundColor: primary, color: primaryText }}
                >
                  {section.ctaLabel}
                </a>
              </div>
            </SectionWrapper>
          );
        }

        if (section.type === "faq") {
          return (
            <SectionWrapper key={section.id}>
              <h2 className="text-3xl font-semibold" style={{ color: foreground }}>{section.title}</h2>
              <div className="mt-6 space-y-3">
                {section.items.map((item) => (
                  <article key={item.question} className="rounded-xl border p-5" style={{ borderColor: borderTone, backgroundColor: sectionSurfaceSoft }}>
                    <h3 className="font-semibold" style={{ color: primary }}>{item.question}</h3>
                    <p className="mt-2 text-sm" style={{ color: softText }}>{item.answer}</p>
                  </article>
                ))}
              </div>
            </SectionWrapper>
          );
        }

        if (section.type === "leadForm") {
          return (
            <SectionWrapper key={section.id} id="lead-form">
              <div className="rounded-2xl border p-7" style={{ borderColor: borderTone, backgroundColor: sectionSurface }}>
                <h2 className="text-3xl font-semibold" style={{ color: foreground }}>{section.title}</h2>
                <p className="mt-2 text-sm" style={{ color: softText }}>{section.description}</p>
                <LeadCaptureForm
                  className="mt-5"
                  pageId={pageId}
                  ctaLabel={section.ctaLabel}
                  successMessage={section.successMessage}
                  mode={mode}
                />
              </div>
            </SectionWrapper>
          );
        }

        if (section.type === "footer") {
          return (
            <footer key={section.id} className="border-t" style={{ borderColor: borderTone, backgroundColor: mixHex(background, secondary, 0.16) }}>
              <SectionWrapper>
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: primary }}>{section.companyName}</p>
                    <p className="text-xs" style={{ color: subtleText }}>{section.copyrightText}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {section.links.map((link) => (
                      <a key={link.label} href={link.href} style={{ color: primary }} className="hover:underline">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </SectionWrapper>
            </footer>
          );
        }

        return null;
      })}
    </div>
  );
}
