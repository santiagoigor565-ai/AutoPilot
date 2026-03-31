import { z } from "zod";

export const blockTypeValues = [
  "hero",
  "logos",
  "benefits",
  "features",
  "howItWorks",
  "testimonials",
  "cta",
  "faq",
  "leadForm",
  "footer",
] as const;

export type BlockType = (typeof blockTypeValues)[number];
export const blockTypeSchema = z.enum(blockTypeValues);

const idSchema = z.string().min(3);

const heroBlockSchema = z.object({
  id: idSchema,
  type: z.literal("hero"),
  eyebrow: z.string().min(1).optional(),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
  secondaryLabel: z.string().optional(),
  secondaryHref: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imageAlt: z.string().optional(),
});

const logosBlockSchema = z.object({
  id: idSchema,
  type: z.literal("logos"),
  title: z.string().min(1),
  logos: z.array(z.string().min(1)).min(1),
});

const benefitsBlockSchema = z.object({
  id: idSchema,
  type: z.literal("benefits"),
  title: z.string().min(1),
  items: z.array(z.object({ title: z.string().min(1), description: z.string().min(1) })).min(1),
});

const featuresBlockSchema = z.object({
  id: idSchema,
  type: z.literal("features"),
  title: z.string().min(1),
  items: z.array(z.object({ title: z.string().min(1), description: z.string().min(1) })).min(1),
});

const howItWorksBlockSchema = z.object({
  id: idSchema,
  type: z.literal("howItWorks"),
  title: z.string().min(1),
  steps: z.array(z.object({ title: z.string().min(1), description: z.string().min(1) })).min(1),
});

const testimonialsBlockSchema = z.object({
  id: idSchema,
  type: z.literal("testimonials"),
  title: z.string().min(1),
  items: z
    .array(
      z.object({
        quote: z.string().min(1),
        author: z.string().min(1),
        role: z.string().min(1),
      }),
    )
    .min(1),
});

const ctaBlockSchema = z.object({
  id: idSchema,
  type: z.literal("cta"),
  title: z.string().min(1),
  description: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
});

const faqBlockSchema = z.object({
  id: idSchema,
  type: z.literal("faq"),
  title: z.string().min(1),
  items: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).min(1),
});

const leadFormBlockSchema = z.object({
  id: idSchema,
  type: z.literal("leadForm"),
  title: z.string().min(1),
  description: z.string().min(1),
  ctaLabel: z.string().min(1),
  successMessage: z.string().min(1),
});

const footerBlockSchema = z.object({
  id: idSchema,
  type: z.literal("footer"),
  companyName: z.string().min(1),
  copyrightText: z.string().min(1),
  links: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })).default([]),
});

export const landingBlockSchema = z.discriminatedUnion("type", [
  heroBlockSchema,
  logosBlockSchema,
  benefitsBlockSchema,
  featuresBlockSchema,
  howItWorksBlockSchema,
  testimonialsBlockSchema,
  ctaBlockSchema,
  faqBlockSchema,
  leadFormBlockSchema,
  footerBlockSchema,
]);

export const themeSchema = z.object({
  primaryColor: z.string().min(1),
  secondaryColor: z.string().min(1),
  accentColor: z.string().min(1),
  backgroundColor: z.string().min(1),
  foregroundColor: z.string().min(1),
});

export const landingContentSchema = z.object({
  theme: themeSchema,
  sections: z.array(landingBlockSchema).min(1),
});

export type LandingBlock = z.infer<typeof landingBlockSchema>;
export type LandingContent = z.infer<typeof landingContentSchema>;

function makeId(prefix: string) {
  const safeRandom = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${prefix}-${safeRandom}`;
}

export function createDefaultBlock(type: BlockType): LandingBlock {
  switch (type) {
    case "hero":
      return {
        id: makeId("hero"),
        type: "hero",
        eyebrow: "SaaS multi-tenant para campanhas",
        title: "Converta visitas em vendas com uma landing page premium",
        subtitle: "Edite em minutos, publique sem friccao e acompanhe resultados em um dashboard unico.",
        ctaLabel: "Comecar agora",
        ctaHref: "#lead-form",
        secondaryLabel: "Ver demo",
        secondaryHref: "#como-funciona",
        imageUrl: "",
        imageAlt: "Preview da landing page",
      };
    case "logos":
      return {
        id: makeId("logos"),
        type: "logos",
        title: "Times que confiam no seu produto",
        logos: ["Atlas Capital", "Pulse Tech", "CoreData", "Aurum Lab"],
      };
    case "benefits":
      return {
        id: makeId("benefits"),
        type: "benefits",
        title: "Beneficios claros para operar com velocidade",
        items: [
          { title: "Builder por blocos", description: "Estruture paginas com consistencia e sem curva longa." },
          { title: "Publicacao segura", description: "Draft e published separados para evitar erros em producao." },
          { title: "Governanca multi-tenant", description: "Controle de acesso por workspace com papeis." },
        ],
      };
    case "features":
      return {
        id: makeId("features"),
        type: "features",
        title: "Funcionalidades essenciais para escalar",
        items: [
          { title: "Versionamento", description: "Cada publicacao gera snapshot com rollback." },
          { title: "Leads nativos", description: "Formularios conectados ao dashboard e banco interno." },
          { title: "Subdominios", description: "Publicacao direta em cliente.seudominio.com." },
        ],
      };
    case "howItWorks":
      return {
        id: makeId("how"),
        type: "howItWorks",
        title: "Como funciona",
        steps: [
          { title: "1. Crie sua pagina", description: "Escolha os blocos e personalize conteudo." },
          { title: "2. Revise no preview", description: "Valide mobile e desktop antes de publicar." },
          { title: "3. Publique e capture leads", description: "Ative a versao publicada com um clique." },
        ],
      };
    case "testimonials":
      return {
        id: makeId("testimonials"),
        type: "testimonials",
        title: "Depoimentos",
        items: [
          {
            quote: "Conseguimos publicar novas campanhas no mesmo dia sem depender de deploy separado.",
            author: "Mariana Costa",
            role: "Head de Growth",
          },
          {
            quote: "O fluxo draft/published trouxe seguranca para o time comercial.",
            author: "Eduardo Lima",
            role: "COO",
          },
        ],
      };
    case "cta":
      return {
        id: makeId("cta"),
        type: "cta",
        title: "Pronto para publicar sua proxima campanha?",
        description: "Comece em minutos com um workspace organizado e layout profissional.",
        ctaLabel: "Criar conta",
        ctaHref: "/signup",
      };
    case "faq":
      return {
        id: makeId("faq"),
        type: "faq",
        title: "Perguntas frequentes",
        items: [
          { question: "Posso editar sem publicar?", answer: "Sim. Toda alteracao fica no draft ate confirmar." },
          { question: "Tem controle de acesso?", answer: "Sim. Use owner, admin, editor e viewer por workspace." },
          { question: "Posso usar dominio customizado?", answer: "A arquitetura ja esta pronta para essa evolucao." },
        ],
      };
    case "leadForm":
      return {
        id: makeId("lead"),
        type: "leadForm",
        title: "Fale com nosso time",
        description: "Deixe seus dados para receber uma demonstracao.",
        ctaLabel: "Enviar contato",
        successMessage: "Recebemos seu contato. Retornaremos em breve.",
      };
    case "footer":
      return {
        id: makeId("footer"),
        type: "footer",
        companyName: "AutoPilot.com",
        copyrightText: "Todos os direitos reservados.",
        links: [
          { label: "Privacidade", href: "/privacy" },
          { label: "Termos", href: "/terms" },
        ],
      };
  }
}

export function createDefaultLandingContent(): LandingContent {
  return {
    theme: {
      primaryColor: "#0077ff",
      secondaryColor: "#1fd2a7",
      accentColor: "#6dd5ff",
      backgroundColor: "#edf5ff",
      foregroundColor: "#0d1d36",
    },
    sections: [
      createDefaultBlock("hero"),
      createDefaultBlock("logos"),
      createDefaultBlock("benefits"),
      createDefaultBlock("features"),
      createDefaultBlock("howItWorks"),
      createDefaultBlock("testimonials"),
      createDefaultBlock("cta"),
      createDefaultBlock("faq"),
      createDefaultBlock("leadForm"),
      createDefaultBlock("footer"),
    ],
  };
}

export function parseLandingContent(content: unknown): LandingContent {
  const parsed = landingContentSchema.safeParse(content);
  if (!parsed.success) {
    return createDefaultLandingContent();
  }
  return parsed.data;
}
