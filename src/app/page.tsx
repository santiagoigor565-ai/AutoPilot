import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  Bot,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CheckCircle2,
  Clock3,
  Handshake,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageSquareText,
  MonitorSmartphone,
  MousePointerClick,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsappLeadForm } from "@/components/marketing/whatsapp-lead-form";
import { buildWhatsappHref, contact } from "@/lib/contact";

type NavigationItem = {
  label: string;
  href: string;
};

type StepItem = {
  title: string;
  description: string;
};

type ResourceItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type ClientItem = {
  name: string;
  segment: string;
  result: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

const navigation: NavigationItem[] = [
  { label: "Solução", href: "#solucao" },
  { label: "Recursos", href: "#recursos" },
  { label: "Clientes", href: "#clientes" },
  { label: "Atendimento", href: "#atendimento" },
];

const packageServices = [
  "Landing page profissional pronta para mobile e Google",
  "Hospedagem segura com SSL e monitoramento contínuo",
  "Domínio .com.br incluso durante o plano ativo",
  "Painel para atualizar textos, imagens e campanhas",
  "Integrações para WhatsApp, formulários e automações",
  "Suporte humano com foco em performance de conversão",
];

const steps: StepItem[] = [
  {
    title: "Diagnóstico e contratação",
    description: "Você escolhe o plano e nosso time mapeia objetivo, público e oferta principal.",
  },
  {
    title: "Estruturação guiada",
    description: "Organizamos conteúdo, blocos e gatilhos de conversão para acelerar o lançamento.",
  },
  {
    title: "Publicação e otimização",
    description: "Seu projeto entra no ar em poucos dias e seguimos evoluindo a taxa de resultado.",
  },
];

const resources: ResourceItem[] = [
  {
    icon: LayoutDashboard,
    title: "Painel de gestão",
    description: "Controle sua presença digital sem depender de tarefas técnicas complexas.",
  },
  {
    icon: MonitorSmartphone,
    title: "Design responsivo",
    description: "Experiência otimizada para desktop, tablet e smartphone.",
  },
  {
    icon: Search,
    title: "Base SEO",
    description: "Arquitetura pensada para melhorar alcance orgânico no Google.",
  },
  {
    icon: MessageSquareText,
    title: "Conversão por WhatsApp",
    description: "Botões e fluxo de contato direto para acelerar fechamento.",
  },
  {
    icon: UsersRound,
    title: "Prova social",
    description: "Depoimentos e credenciais para elevar confiança da audiência.",
  },
  {
    icon: MapPin,
    title: "Presença local",
    description: "Mapa integrado para clientes encontrarem sua operação com rapidez.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Catálogo de serviços",
    description: "Organize produtos e serviços de forma clara e comercial.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Métricas de aquisição",
    description: "Estrutura pronta para medir evolução de leads e oportunidades.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança ativa",
    description: "Camada técnica para manter estabilidade e proteção do projeto.",
  },
  {
    icon: Bot,
    title: "Automações",
    description: "Respostas e fluxos inteligentes para ganho de velocidade no atendimento.",
  },
  {
    icon: Blocks,
    title: "Blocos escaláveis",
    description: "Layout modular para crescer sem refazer tudo do zero.",
  },
  {
    icon: Handshake,
    title: "Time consultivo",
    description: "Especialistas acompanhando evolução do seu funil digital.",
  },
];

const clients: ClientItem[] = [
  {
    name: "Aurora Contabilidade",
    segment: "Contabilidade consultiva",
    result: "Aumento de 38% nos contatos qualificados em 60 dias.",
  },
  {
    name: "Rios Engenharia",
    segment: "Projetos e execução",
    result: "Saída do zero digital para 17 oportunidades no primeiro mês.",
  },
  {
    name: "Acesso Clínica Integrada",
    segment: "Saúde e bem-estar",
    result: "Dobro de agendamentos online com nova jornada de contato.",
  },
  {
    name: "Atlas Segurança",
    segment: "Serviços empresariais",
    result: "Cinco novos contratos fechados diretamente pelo site.",
  },
  {
    name: "Maresia Gastronomia",
    segment: "Restaurante e eventos",
    result: "Unificação de reservas, campanhas e cardápio em um único fluxo.",
  },
  {
    name: "Plena Advocacia",
    segment: "Escritório jurídico",
    result: "Maior autoridade digital com narrativa e prova social estruturadas.",
  },
];

const faq: FaqItem[] = [
  {
    question: "Existe custo extra além da mensalidade?",
    answer: "Não. Os recursos principais da operação já estão contemplados no plano contratado.",
  },
  {
    question: "Posso usar um domínio que já possuo?",
    answer: "Sim. Fazemos o apontamento técnico para manter sua operação sem interrupção.",
  },
  {
    question: "Consigo atualizar conteúdo depois?",
    answer: "Sim. O sistema foi desenhado para edição contínua com suporte da nossa equipe.",
  },
  {
    question: "Vocês atendem qualquer segmento?",
    answer: "Atendemos negócios locais e empresas B2B com foco em geração de demanda.",
  },
  {
    question: "Quanto tempo para o projeto ficar no ar?",
    answer: "A média é de até 7 dias após recebimento do material essencial.",
  },
];

const marketSegments = ["Advocacia", "Engenharia", "Clínicas", "Educação", "Comércio", "Serviços B2B"];

const whatsappNumber = contact.whatsappNumber;
const contactPhone = contact.phoneDisplay;
const contactEmail = contact.email;
const heroWhatsappMessage = "Oi! Quero conhecer o AutoPilot.com para acelerar minha presença digital.";
const whatsappHref = buildWhatsappHref(heroWhatsappMessage);

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
            <span className="hidden text-sm font-semibold text-[#2d4f76] sm:block">Aquisição previsível para negócios em crescimento</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[#3a5c87] md:flex">
            {navigation.map((item) => (
              <a key={item.label} href={item.href} className="transition-colors hover:text-[#0077ff]">
                {item.label}
              </a>
            ))}
          </nav>
          <Button asChild className="primary-glow rounded-full bg-[#0077ff] text-[#eef5ff] hover:bg-[#005fd1]">
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              Iniciar com AutoPilot
            </a>
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-[1520px] gap-8 px-2 pb-18 pt-16 md:grid-cols-[1.08fr_0.92fr] md:items-center md:px-3">
          <div className="reveal">
            <p className="section-kicker">Sistema de presença digital orientado a performance</p>
            <h1 className="section-title">
              Coloque sua empresa no piloto automático de aquisição a partir de <span className="text-[#0077ff]">R$ 49/mês</span>.
            </h1>
            <p className="section-text max-w-2xl">
              O AutoPilot.com combina estratégia, tecnologia e suporte contínuo para transformar tráfego em oportunidades comerciais reais.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="primary-glow rounded-full bg-[#0077ff] px-8 text-[#eef6ff] hover:bg-[#005dd0]">
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  Falar com especialista
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-[#4e74a6] bg-[#f8fbff]/80 text-[#2f527f] hover:bg-[#e3eeff]">
                <a href="#clientes">Ver casos reais</a>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {["Entrega em até 7 dias", "Domínio incluso", "Suporte contínuo"].map((item, index) => (
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
          <article className="surface-card reveal relative overflow-hidden p-7 md:p-8" style={{ animationDelay: "120ms" }}>
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#00b8ff]/22 blur-3xl" />
            <div className="absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-[#1fd2a7]/18 blur-3xl" />
            <p className="relative inline-flex items-center gap-2 rounded-full border border-[#ffb454]/45 bg-[#fff5e6] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#8b4f00]">
              <Sparkles className="h-3.5 w-3.5" />
              Identidade AutoPilot.com
            </p>
            <h2 className="relative mt-5 text-3xl font-semibold leading-tight text-[#0f2947]">Pacote completo para acelerar sua presença digital</h2>
            <p className="relative mt-3 text-sm leading-relaxed text-[#3f628e]">
              Receba estrutura técnica, design orientado à conversão e acompanhamento contínuo para crescer com previsibilidade.
            </p>
            <div className="relative mt-6 rounded-2xl border border-[#0b3f7a]/18 bg-[#0b2442] p-5 text-[#eaf4ff]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#96dfff]">Plano de entrada</p>
              <p className="mt-2 text-4xl font-bold tracking-tight">R$ 49</p>
              <p className="text-sm text-[#b8d7ff]">por mês, com setup operacional incluso</p>
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#006fdc] underline-offset-4 hover:underline"
            >
              Solicitar proposta personalizada
              <ArrowRight className="h-4 w-4" />
            </a>
          </article>
        </section>

        <section id="solucao" className="mx-auto w-full max-w-[1520px] px-2 pb-18 md:px-3">
          <div className="grid gap-8 md:grid-cols-[1.02fr_0.98fr]">
            <article className="surface-card reveal p-8">
              <p className="section-kicker">Nossa solução</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#0f2748]">Um sistema único para gerar demanda com consistência</h2>
              <p className="mt-4 text-base leading-relaxed text-[#3e628f]">
                Em vez de contratar vários fornecedores, você concentra estratégia, execução e suporte em um único ecossistema.
              </p>
              <ul className="mt-6 space-y-3">
                {packageServices.map((service, index) => (
                  <li key={service} className="reveal flex items-start gap-3 text-sm leading-relaxed text-[#345b8a]" style={{ animationDelay: `${index * 90 + 90}ms` }}>
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0077ff]" />
                    {service}
                  </li>
                ))}
              </ul>
            </article>
            <article className="surface-card reveal p-8" style={{ animationDelay: "90ms" }}>
              <p className="section-kicker">Como funciona</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#0f2748]">Processo enxuto, entrega rápida e melhoria contínua</h2>
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
            <p className="section-kicker">Recursos do sistema</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#0f2748]">Tudo que sua operação precisa para vender mais online</h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#3f648f]">
              O AutoPilot.com conecta tecnologia e posicionamento comercial para transformar visitas em oportunidades.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <article
                    key={resource.title}
                    className="surface-card reveal flex h-full flex-col p-5"
                    style={{ animationDelay: `${index * 60 + 80}ms` }}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#0077ff]/24 bg-[#e9f3ff] text-[#0077ff]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-[#13365f]">{resource.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#4d719d]">{resource.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="clientes" className="mx-auto w-full max-w-[1520px] px-2 py-18 md:px-3">
          <p className="section-kicker">Resultados reais</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#0f2748]">Projetos desenhados para segmentos com meta de crescimento previsível</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {clients.map((client, index) => (
              <article key={client.name} className="surface-card reveal p-5" style={{ animationDelay: `${index * 80 + 80}ms` }}>
                <p className="text-sm font-semibold uppercase tracking-[0.1em] text-[#0077ff]">{client.segment}</p>
                <h3 className="mt-2 text-xl font-semibold text-[#13365f]">{client.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4e729e]">{client.result}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#c6d9f2] bg-[#eaf3ff]/80 py-18">
          <div className="mx-auto grid w-full max-w-[1520px] gap-8 px-2 md:grid-cols-[1.1fr_0.9fr] md:items-start md:px-3">
            <div>
              <p className="section-kicker">Perguntas frequentes</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#0f2748]">Respostas diretas para acelerar sua decisão</h2>
              <p className="mt-4 text-base leading-relaxed text-[#3f648f]">
                Se preferir, podemos orientar sua contratação agora mesmo pelo WhatsApp.
              </p>
              <Button asChild variant="outline" className="mt-6 rounded-full border-[#3e6794] bg-transparent text-[#345987] hover:bg-[#dbe9ff]">
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
              <h2 className="mt-3 text-3xl font-semibold text-[#0f2748]">Vamos colocar seu projeto no AutoPilot.com?</h2>
              <p className="mt-4 text-sm leading-relaxed text-[#486f9c]">
                Preencha o formulário e abrimos uma conversa com contexto completo para acelerar seu onboarding.
              </p>
              <div className="mt-6 space-y-3 text-sm">
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-[#0077ff]/25 bg-[#edf5ff] px-3 py-2 font-semibold text-[#2d6098]">
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
              Identidade digital, tecnologia e performance comercial em uma única plataforma.
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
        className="floating-cta fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#0077ff] px-4 py-3 text-sm font-semibold text-[#edf6ff] shadow-[0_14px_28px_rgb(0_119_255_/_38%)] transition hover:bg-[#005dd0]"
      >
        <MessageSquareText className="h-4 w-4" />
        WhatsApp
      </a>
    </div>
  );
}

