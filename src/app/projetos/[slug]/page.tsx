import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ProjectPricingPanel } from "@/components/marketing/project-pricing-panel";
import { getProjectOffer, projectOffers } from "@/lib/project-offers";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

const systemsCases = [
  {
    title: "Findmy Angel",
    href: "https://www.findmyangel.com/",
    description: "Plataforma construída para fluxo operacional específico de negócio.",
  },
  {
    title: "Doutor Eu",
    href: "https://projeto-tadeu-adv-web.vercel.app/",
    description: "Projeto direcional com foco em presença digital e aquisição.",
  },
];

export function generateStaticParams() {
  return projectOffers.map((offer) => ({ slug: offer.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const offer = getProjectOffer(slug);

  if (!offer) {
    return {
      title: "Projeto não encontrado | AutoPilot.com",
    };
  }

  return {
    title: `${offer.title} | AutoPilot.com`,
    description: offer.overview,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const offer = getProjectOffer(slug);

  if (!offer) {
    notFound();
  }

  const isSystemsProject = offer.slug === "sistemas-automacao-interna";

  return (
    <div className="min-h-screen">
      <MarketingNav mode="pricing" />

      <main className="mx-auto w-full max-w-[1520px] px-2 py-14 md:px-3">
        <Link href="/#recursos" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2f5d95] hover:text-[#0077ff]">
          <ArrowRight className="h-4 w-4 rotate-180" />
          Voltar para os escopos
        </Link>

        <header className="mt-5 max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0077ff]">{offer.keyword}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#102a4a] md:text-5xl">{offer.title}</h1>
          <p className="mt-3 text-base text-[#486b98] md:text-lg">{offer.subtitle}</p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="surface-card p-7">
            <h2 className="text-2xl font-semibold text-[#13365f]">Como funciona</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#4d719d]">{offer.overview}</p>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0077ff]">Etapas de execução</p>
              <ul className="mt-3 space-y-2">
                {offer.howItWorks.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-[#416792]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#19A85E]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0077ff]">Entregas do escopo</p>
              <ul className="mt-3 space-y-2">
                {offer.scopeItems.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-[#416792]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#19A85E]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0077ff]">Exemplos</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {offer.references.map((reference) => (
                  <a
                    key={reference.href}
                    href={reference.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-[#8fb5e5] bg-[#f8fbff] px-3 py-1.5 text-xs font-semibold text-[#2b5688] hover:bg-[#e4efff]"
                  >
                    {reference.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </article>

          <ProjectPricingPanel offer={offer} />
        </div>

        {isSystemsProject ? (
          <section className="mt-8">
            <article className="surface-card p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0077ff]">Cases de sucesso</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#13365f] md:text-3xl">Visualizador de projetos em produção</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#4d719d]">
                Explore duas referências da frente de sistemas para apresentar melhor o padrão de entrega.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {systemsCases.map((item) => (
                  <article key={item.href} className="overflow-hidden rounded-2xl border border-[#b8d2f1] bg-[#f8fbff]">
                    <div className="flex items-center justify-between border-b border-[#c6dbf4] bg-[#eef5ff] px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#f6c453]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#2ccf84]" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#4f74a1]">{item.title}</span>
                    </div>
                    <iframe
                      src={item.href}
                      title={`Visualizador ${item.title}`}
                      className="h-[360px] w-full bg-[#e9f3ff]"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="border-t border-[#c6dbf4] px-4 py-3">
                      <p className="text-sm text-[#4d719d]">{item.description}</p>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#006fdc] hover:underline"
                      >
                        Abrir site completo
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </section>
        ) : null}
      </main>

      <MarketingFooter />
    </div>
  );
}
