import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareText,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectSwitch } from "@/components/marketing/project-switch";
import { WhatsappLeadForm } from "@/components/marketing/whatsapp-lead-form";
import { ActiveScopesShowcase } from "@/components/marketing/active-scopes-showcase";
import { buildWhatsappHref, contact } from "@/lib/contact";

type NavigationItem = {
  label: string;
  href: string;
};

type StepItem = {
  title: string;
  description: string;
};

type BusinessModelItem = {
  title: string;
  description: string;
  highlight: string;
  linkLabel?: string;
  linkHref?: string;
};

type ProjectItem = {
  name: string;
  category: string;
  summary: string;
  href: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

const navigation: NavigationItem[] = [
  { label: "Solução", href: "#solucao" },
  { label: "Escopos", href: "#recursos" },
  { label: "Portfólio", href: "#clientes" },
  { label: "Atendimento", href: "#atendimento" },
];

const capabilities = [
  "Projetos SaaS proprietários com evolução contínua de produto",
  "Software House para desenvolvimento de sistemas internos personalizados",
  "Automação de WhatsApp com IA dedicada para atendimento e vendas",
  "Sites e aplicativos exclusivos para operações PJ",
  "Landing pages com integrações externas (WhatsApp, e-mail, blog e CRM)",
  "Entrega consultiva com foco em resultado de negócio, não apenas em código",
];

const steps: StepItem[] = [
  {
    title: "Diagnóstico técnico e comercial",
    description: "Mapeamos objetivo, operação atual e gargalos para definir o escopo ideal.",
  },
  {
    title: "Arquitetura e implementação",
    description: "Executamos o projeto com tecnologia alinhada ao nível de maturidade da empresa.",
  },
  {
    title: "Evolução contínua",
    description: "Acompanhamos métricas, ajustes e expansão para manter crescimento previsível.",
  },
];

const businessModels: BusinessModelItem[] = [
  {
    title: "Produtos proprietários com assinatura",
    description: "Desenvolvemos e operamos softwares próprios usáveis por clientes pagantes.",
    highlight: "Destaque atual: AutoWhats, automação de WhatsApp com IA para vendas e atendimento.",
    linkLabel: "Acessar AutoWhats",
    linkHref: "https://auto-whats.vercel.app/pt",
  },
  {
    title: "Software House para projetos sob medida",
    description: "Implementamos projetos direcionais para empresas com necessidades específicas.",
    highlight: "Inclui sistemas internos personalizados para PJ, sites institucionais e aplicativos exclusivos.",
  },
];

const projects: ProjectItem[] = [
  {
    name: "AutoWhats",
    category: "Produto proprietário (SaaS)",
    summary: "Automação de WhatsApp com IA para atendimento comercial e escala de conversas.",
    href: "https://auto-whats.vercel.app/pt",
  },
  {
    name: "Findmy Angel",
    category: "Sistema sob medida",
    summary: "Plataforma desenvolvida para resolver fluxo operacional específico de negócio.",
    href: "https://www.findmyangel.com/",
  },
  {
    name: "Doutor Eu",
    category: "Projeto direcional",
    summary: "Implementação personalizada com foco em presença digital e jornada de aquisição.",
    href: "https://projeto-tadeu-adv-web.vercel.app/",
  },
  {
    name: "CAMAF",
    category: "Landing page com integrações",
    summary: "Exemplo de landing page pronta para conversão com canais externos conectados.",
    href: "https://camaf-davi.vercel.app/",
  },
];

const faq: FaqItem[] = [
  {
    question: "Vocês trabalham com software pronto e também com projeto personalizado?",
    answer: "Sim. Atuamos com os dois modelos: produtos proprietários (como o AutoWhats) e software house sob demanda para empresas.",
  },
  {
    question: "No escopo de gestão e tráfego, o investimento de mídia está incluso?",
    answer: "Não. O valor de R$ 1.500/mês cobre gestão e operação técnica. A verba de tráfego é definida separadamente com o cliente.",
  },
  {
    question: "Quanto tempo leva para colocar uma landing no ar?",
    answer: "O site inicial pode entrar no ar em até 2 dias após envio das informações essenciais, com ajustes de prazo conforme alinhamento.",
  },
  {
    question: "Como funciona o preço de sistemas e automações internas?",
    answer: "Esse escopo é sob demanda, pois depende do nível de complexidade, integrações e volume de funcionalidades de cada operação.",
  },
  {
    question: "As landings podem integrar WhatsApp, e-mail e outros canais?",
    answer: "Sim. Estruturamos integrações com WhatsApp, e-mail, blog e demais conexões externas necessárias ao seu funil.",
  },
];

const marketSegments = ["SaaS Proprietário", "Software House PJ", "Automação com IA", "Landing Pages", "Sistemas Internos", "Tráfego e Conversão"];

const whatsappNumber = contact.whatsappNumber;
const contactPhone = contact.phoneDisplay;
const contactEmail = contact.email;
const heroWhatsappMessage = "Oi! Quero mapear um projeto de programação para minha empresa.";
const whatsappHref = buildWhatsappHref(heroWhatsappMessage);

const partners = ["TESTE 01", "TESTE 02", "TESTE 03", "TESTE 04", "TESTE 05", "TESTE 06", "TESTE 07", "TESTE 08", "TESTE 09"];

export default function HomePage() {
  return (
    <div className="site-shell">
      <div className="border-b border-[#c4d6f2] bg-[#081a2f] text-[#e8f3ff]">
        <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-2 px-2 py-2 text-xs sm:flex-row sm:items-center sm:justify-between md:px-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-[#7be7ff]">
              <MessageSquareText className="h-3.5 w-3.5" />
              WhatsApp {contactPhone}
            </a>
            <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-2 hover:text-[#7be7ff]">
              <Mail className="h-3.5 w-3.5" />
              {contactEmail}
            </a>
          </div>
          <p className="inline-flex items-center gap-2 text-[#b7cbe7]">
            <Clock3 className="h-3.5 w-3.5" />
            Atendimento comercial de segunda a sexta
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-[#c5d7f1] bg-[#f3f8ff]/94 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1520px] items-center justify-between px-2 py-4 md:px-3">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="rounded-full border border-[#0a4d8e]/35 bg-[#0d2f56] px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#e7f6ff]">
              AutoPilot.com
            </span>
            <span className="hidden text-sm font-semibold text-[#2d4f76] sm:block">Projetos de programação para empresas com foco em resultado</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[#3a5c87] md:flex">
            {navigation.map((item) => (
              <a key={item.label} href={item.href} className="transition-colors hover:text-[#0077ff]">
                {item.label}
              </a>
            ))}
          </nav>
          <Button asChild className="primary-glow rounded-full bg-[#19A85E] text-[#f4fff8] hover:bg-[#14884b]">
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              Iniciar diagnóstico
            </a>
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-[1520px] gap-8 px-2 pb-18 pt-16 md:grid-cols-[1.08fr_0.92fr] md:items-center md:px-3">
          <div className="reveal">
            <p className="section-kicker">Produtos Proprietários + Software House</p>
            <h1 className="section-title">
              Projetos de programação para empresas: <span className="text-[#0077ff]">sistemas, automações com IA e landing pages de alta conversão</span>.
            </h1>
            <p className="section-text max-w-2xl">
              Atuamos em duas frentes: softwares próprios com assinatura e desenvolvimento sob medida para operações PJ que precisam escalar com velocidade.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="primary-glow rounded-full bg-[#19A85E] px-8 text-[#f4fff8] hover:bg-[#14884b]">
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  Falar com especialista
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-[#4e74a6] bg-[#f8fbff]/80 text-[#2f527f] hover:bg-[#e3eeff]">
                <a href="#recursos">Ver escopos de contratação</a>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {["AutoWhats com IA", "Sistemas internos sob medida", "Landing inicial em até 2 dias"].map((item, index) => (
                <span
                  key={item}
                  className="reveal inline-flex items-center gap-2 rounded-full border border-[#0077ff]/30 bg-[#f1f7ff] px-4 py-2 text-sm font-semibold text-[#2f5d95]"
                  style={{ animationDelay: `${index * 120 + 120}ms` }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <ActiveScopesShowcase style={{ animationDelay: "120ms" }} />
        </section>

        <section className="mt-[34px] mb-10 border-y border-[#c6d9f2] bg-[#f4f8ff]/85 pt-[34px] pb-10">
          <div className="partners-marquee mt-[14px]">
            <div className="partners-track">
              <div className="partners-group">
                {partners.map((partner, index) => (
                  <span key={`a-${partner}-${index}`} className="partner-item">
                    {partner}
                  </span>
                ))}
              </div>
              <div className="partners-group" aria-hidden="true">
                {partners.map((partner, index) => (
                  <span key={`b-${partner}-${index}`} className="partner-item">
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="solucao" className="mx-auto w-full max-w-[1520px] px-2 pb-18 md:px-3">
          <div className="grid gap-8 md:grid-cols-[1.02fr_0.98fr]">
            <article className="surface-card reveal p-8">
              <p className="section-kicker">Modelos de atuação</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#0f2748]">Produto próprio e software house no mesmo ecossistema</h2>
              <div className="mt-6 space-y-4">
                {businessModels.map((item, index) => (
                  <div key={item.title} className="reveal rounded-2xl border border-[#0b3f7a]/18 bg-[#f4f9ff] p-5" style={{ animationDelay: `${index * 110 + 100}ms` }}>
                    <h3 className="text-lg font-semibold text-[#143760]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#4b6f9b]">{item.description}</p>
                    <p className="mt-3 text-sm font-medium text-[#1d4f85]">{item.highlight}</p>
                    {item.linkHref ? (
                      <a href={item.linkHref} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#006fdc] hover:underline">
                        {item.linkLabel}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </article>

            <article className="surface-card reveal p-8" style={{ animationDelay: "90ms" }}>
              <p className="section-kicker">Capacidade técnica</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#0f2748]">Arquitetura, implementação e acompanhamento contínuo</h2>
              <ul className="mt-6 space-y-3">
                {capabilities.map((item, index) => (
                  <li key={item} className="reveal flex items-start gap-3 text-sm leading-relaxed text-[#345b8a]" style={{ animationDelay: `${index * 90 + 90}ms` }}>
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0077ff]" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-4">
                {steps.map((step, index) => (
                  <div key={step.title} className="reveal rounded-2xl border border-[#0b3f7a]/18 bg-[#f4f9ff] p-4" style={{ animationDelay: `${index * 100 + 120}ms` }}>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0077ff]">Etapa {index + 1}</p>
                    <h3 className="mt-2 text-lg font-semibold text-[#173961]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#476d9b]">{step.description}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section id="recursos" className="border-y border-[#c6d9f2] bg-[#edf5ff]/75 py-18">
          <div className="mx-auto w-full max-w-[1520px] px-2 md:px-3">
            <p className="section-kicker">Escopos iniciais de contratação</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#0f2748]">Escolha um projeto e abra a subpágina detalhada</h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#3f648f]">
              O switch abaixo destaca cada frente com sua proposta. Ao selecionar, você pode acessar uma página completa com explicação técnica e pricing detalhado.
            </p>
            <ProjectSwitch className="mt-8 reveal" />
          </div>
        </section>

        <section id="clientes" className="mx-auto w-full max-w-[1520px] px-2 py-18 md:px-3">
          <p className="section-kicker">Projetos em produção</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#0f2748]">Referências reais de produto proprietário e projetos sob medida</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {projects.map((project, index) => (
              <article key={project.name} className="surface-card reveal flex h-full flex-col p-5" style={{ animationDelay: `${index * 80 + 80}ms` }}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0077ff]">{project.category}</p>
                <h3 className="mt-2 text-xl font-semibold text-[#13365f]">{project.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4e729e]">{project.summary}</p>
                <a href={project.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#006fdc] hover:underline">
                  Acessar projeto
                  <ArrowRight className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#c6d9f2] bg-[#eaf3ff]/80 py-18">
          <div className="mx-auto grid w-full max-w-[1520px] gap-8 px-2 md:grid-cols-[1.1fr_0.9fr] md:items-start md:px-3">
            <div>
              <p className="section-kicker">Perguntas frequentes</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#0f2748]">Respostas diretas para facilitar sua decisão</h2>
              <p className="mt-4 text-base leading-relaxed text-[#3f648f]">
                Se preferir, orientamos o melhor escopo para seu cenário agora mesmo pelo WhatsApp.
              </p>
              <Button asChild className="mt-6 rounded-full bg-[#19A85E] text-[#f4fff8] hover:bg-[#14884b]">
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  Falar com atendimento
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="space-y-3">
              {faq.map((item, index) => (
                <details key={item.question} className="faq-item reveal" style={{ animationDelay: `${index * 80 + 100}ms` }}>
                  <summary>{item.question}</summary>
                  <p className="pt-3 text-sm leading-relaxed text-[#486e9b]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="atendimento" className="mx-auto w-full max-w-[1520px] px-2 pb-18 pt-18 md:px-3">
          <div className="grid gap-6 md:grid-cols-[0.92fr_1.08fr]">
            <article className="surface-card reveal p-7">
              <p className="section-kicker">Atendimento</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#0f2748]">Vamos desenhar o seu próximo projeto?</h2>
              <p className="mt-4 text-sm leading-relaxed text-[#486f9c]">
                Envie seu contexto e abrimos uma conversa com proposta técnica e comercial alinhada ao seu objetivo.
              </p>
              <div className="mt-6 space-y-3 text-sm">
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-[#19A85E]/35 bg-[#e9f8ef] px-3 py-2 font-semibold text-[#157748]">
                  <MessageSquareText className="h-4 w-4" />
                  WhatsApp: {contactPhone}
                </a>
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 rounded-xl border border-[#0077ff]/20 bg-[#f5f9ff] px-3 py-2 text-[#456b99]">
                  <Mail className="h-4 w-4" />
                  {contactEmail}
                </a>
                <p className="flex items-center gap-2 rounded-xl border border-[#0077ff]/18 bg-[#f5f9ff] px-3 py-2 text-[#456b99]">
                  <MousePointerClick className="h-4 w-4" />
                  Tempo médio de resposta: até 15 minutos no horário comercial.
                </p>
              </div>
            </article>
            <WhatsappLeadForm whatsappNumber={whatsappNumber} defaultMessage={heroWhatsappMessage} className="reveal" />
          </div>
        </section>
      </main>

      <footer className="border-t border-[#bdd2ee] bg-[#091b31] text-[#ddecff]">
        <div className="mx-auto grid w-full max-w-[1520px] gap-8 px-2 py-12 md:grid-cols-[1fr_auto] md:px-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#84d6ff]">AutoPilot.com</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#b5cef0]">
              Projetos de tecnologia com foco em aquisição, eficiência operacional e crescimento previsível para empresas.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {marketSegments.map((segment) => (
                <span key={segment} className="rounded-full border border-[#76b7ff]/35 bg-[#112f54] px-3 py-1 text-xs text-[#d3e7ff]">
                  {segment}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-2 text-sm text-[#cadaf1]">
            {navigation.map((item) => (
              <a key={item.label} href={item.href} className="inline-flex items-center gap-2 transition-colors hover:text-[#7be8ff]">
                <ArrowRight className="h-3.5 w-3.5" />
                {item.label}
              </a>
            ))}
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-[#7be8ff]">
              <ArrowRight className="h-3.5 w-3.5" />
              Contratar agora
            </a>
          </div>
        </div>
      </footer>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Abrir conversa no WhatsApp"
        className="floating-cta fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#19A85E] px-4 py-3 text-sm font-semibold text-[#f4fff8] shadow-[0_14px_28px_rgb(25_168_94_/_36%)] transition hover:bg-[#14884b]"
      >
        <MessageSquareText className="h-4 w-4" />
        WhatsApp
      </a>
    </div>
  );
}
