export type ProjectOffer = {
  slug: string;
  keyword: string;
  switchLabel: string;
  title: string;
  subtitle: string;
  overview: string;
  howItWorks: string[];
  scopeItems: string[];
  pricing: {
    headline: string;
    model: string;
    details: string[];
  };
  references: Array<{ label: string; href: string }>;
  whatsappMessage: string;
};

export const projectOffers: ProjectOffer[] = [
  {
    slug: "gestao-trafego-ia",
    keyword: "Tráfego + IA",
    switchLabel: "Tráfego + IA",
    title: "Gestão e tráfego de rede com AutoWhats",
    subtitle: "Aceleração comercial com mídia paga + atendimento inteligente",
    overview:
      "Esse escopo conecta aquisição e atendimento: atraímos demanda via tráfego pago e direcionamos os leads para um fluxo comercial com IA dedicada no WhatsApp.",
    howItWorks: [
      "Definimos metas de aquisição e público-alvo para campanhas de tráfego.",
      "Configuramos e acompanhamos os canais de captação com foco em conversão.",
      "Integramos o atendimento ao AutoWhats para ganho de velocidade no fechamento.",
    ],
    scopeItems: [
      "Estratégia de mídia e acompanhamento contínuo de performance",
      "Acesso ao AutoWhats para automação de atendimento comercial",
      "Conexão entre marketing e atendimento para reduzir perda de lead",
    ],
    pricing: {
      headline: "R$ 1.500/mês + verba de tráfego",
      model: "Operação mensal recorrente",
      details: [
        "Valor mensal cobre gestão técnica e acompanhamento estratégico.",
        "Investimento em mídia é definido separadamente com o cliente.",
        "Escopo pode expandir para novas campanhas conforme crescimento.",
      ],
    },
    references: [{ label: "AutoWhats", href: "https://auto-whats.vercel.app/pt" }],
    whatsappMessage: "Oi! Quero contratar o escopo de Gestão e tráfego de rede + AutoWhats.",
  },
  {
    slug: "sistemas-automacao-interna",
    keyword: "Sistemas",
    switchLabel: "Sistemas",
    title: "Desenvolvimento de sistemas e automação de processos internos",
    subtitle: "Projetos sob medida para operações PJ",
    overview:
      "Construímos sistemas internos personalizados e automações direcionadas ao fluxo real da sua empresa, com foco em produtividade, redução de retrabalho e controle operacional.",
    howItWorks: [
      "Levantamos regras de negócio e gargalos críticos da operação.",
      "Desenhamos arquitetura técnica aderente ao cenário atual da empresa.",
      "Entregamos por etapas com validação contínua junto ao time do cliente.",
    ],
    scopeItems: [
      "Sistemas internos sob medida para processos específicos",
      "Automação de tarefas repetitivas com integrações e regras de negócio",
      "Estrutura técnica preparada para evolução em novas fases",
    ],
    pricing: {
      headline: "Valor variável conforme demanda",
      model: "Proposta sob medida por escopo",
      details: [
        "Investimento definido após diagnóstico técnico e funcional.",
        "Escopos podem ser fechados por projeto completo ou por fases.",
        "Cronograma e orçamento ajustados ao nível de complexidade.",
      ],
    },
    references: [
      { label: "Findmy Angel", href: "https://www.findmyangel.com/" },
      { label: "Doutor Eu", href: "https://projeto-tadeu-adv-web.vercel.app/" },
    ],
    whatsappMessage: "Oi! Quero detalhar um projeto sob demanda de sistemas e automação interna.",
  },
  {
    slug: "landing-pages-conexoes",
    keyword: "LandingPage",
    switchLabel: "LandingPage",
    title: "Criação de Landing Pages com conexões externas",
    subtitle: "Entrega rápida com integração de canais comerciais",
    overview:
      "Esse escopo é voltado para presença digital com velocidade. Estruturamos landing pages com integrações de WhatsApp, e-mail, blog e outros canais para geração de oportunidades.",
    howItWorks: [
      "Recebemos briefing e materiais essenciais da empresa.",
      "Publicamos o site inicial em até 2 dias, conforme alinhamento.",
      "Mantemos disponibilidade de ajustes para evolução contínua da página.",
    ],
    scopeItems: [
      "Landing page com estrutura comercial orientada a conversão",
      "Conexões externas: WhatsApp, e-mail, blog e canais complementares",
      "Ciclo de ajustes para manter mensagem e oferta sempre atualizadas",
    ],
    pricing: {
      headline: "R$ 150/mês para ajustes e manutenção",
      model: "Site inicial em até 2 dias após envio das informações",
      details: [
        "Prazo pode variar conforme alinhamento de conteúdo e escopo.",
        "Mensalidade cobre disponibilidade para ajustes recorrentes.",
        "Integrações adicionais podem ser incluídas conforme necessidade.",
      ],
    },
    references: [{ label: "CAMAF", href: "https://camaf-davi.vercel.app/" }],
    whatsappMessage: "Oi! Quero criar uma landing page com conexões externas e manutenção mensal.",
  },
];

export function getProjectOffer(slug: string) {
  return projectOffers.find((item) => item.slug === slug) ?? null;
}
