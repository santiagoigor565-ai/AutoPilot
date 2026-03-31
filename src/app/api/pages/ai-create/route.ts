import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { env } from "@/lib/env";
import { getApiUser } from "@/lib/server/api-auth";
import { assertWorkspaceAccess, createLandingPage } from "@/lib/server/services/page-service";
import { aiGeneratedLandingSchema, createPageWithAiSchema } from "@/lib/validators/page";
import { slugify } from "@/lib/utils";

const OPENAI_FALLBACK_BASE_URL = "https://api.openai.com/v1";
const MAX_IMAGE_ATTACHMENTS = 8;
const MAX_TEXT_ATTACHMENTS = 3;
const MAX_TEXT_SNIPPET_CHARS = 4_000;

type AttachmentContext = {
  assetId: string;
  url: string;
  mimeType: string;
  size: number;
  filename: string;
};

function isImageMimeType(mimeType: string) {
  return mimeType.toLowerCase().startsWith("image/");
}

function isTextMimeType(mimeType: string) {
  const normalized = mimeType.toLowerCase();
  return (
    normalized.startsWith("text/") ||
    normalized === "application/json" ||
    normalized === "application/xml" ||
    normalized === "application/javascript" ||
    normalized === "application/x-javascript" ||
    normalized === "application/x-ndjson"
  );
}

function truncate(value: string, max: number) {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max)}\n...[texto truncado]`;
}

function sanitizeTextInput(value: string) {
  return value.replace(/\u0000/g, "").trim();
}

async function loadTextAttachmentSnippet(attachment: AttachmentContext) {
  if (!isTextMimeType(attachment.mimeType)) {
    return null;
  }

  try {
    const response = await fetch(attachment.url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const text = sanitizeTextInput(await response.text());
    if (!text) {
      return null;
    }

    return truncate(text, MAX_TEXT_SNIPPET_CHARS);
  } catch {
    return null;
  }
}

async function resolveAvailableSlug(workspaceId: string, rawSlug: string) {
  const normalizedBase = slugify(rawSlug) || `landing-${Date.now()}`;
  const existing = await db.landingPage.findMany({
    where: {
      workspaceId,
      slug: {
        startsWith: normalizedBase,
      },
    },
    select: {
      slug: true,
    },
  });

  const reserved = new Set(existing.map((entry) => entry.slug));
  if (!reserved.has(normalizedBase)) {
    return normalizedBase;
  }

  for (let index = 2; index <= 200; index += 1) {
    const candidate = `${normalizedBase}-${index}`;
    if (!reserved.has(candidate)) {
      return candidate;
    }
  }

  return `${normalizedBase}-${Date.now()}`;
}

async function generateLandingWithAi(params: { prompt: string; attachments: AttachmentContext[] }) {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY nao configurada no servidor.");
  }

  const imageAttachments = params.attachments.filter((attachment) => isImageMimeType(attachment.mimeType)).slice(0, MAX_IMAGE_ATTACHMENTS);
  const textAttachmentCandidates = params.attachments.filter((attachment) => isTextMimeType(attachment.mimeType)).slice(0, MAX_TEXT_ATTACHMENTS);
  const textSnippets = await Promise.all(textAttachmentCandidates.map((attachment) => loadTextAttachmentSnippet(attachment)));

  const attachmentSummary = params.attachments.length
    ? params.attachments
        .map((attachment, index) => `${index + 1}. ${attachment.filename} (${attachment.mimeType}, ${attachment.size} bytes)`)
        .join("\n")
    : "Nenhum arquivo anexado.";

  const extractedTextContext = textAttachmentCandidates
    .map((attachment, index) => {
      const snippet = textSnippets[index];
      if (!snippet) {
        return null;
      }

      return `Arquivo: ${attachment.filename}\nConteudo:\n${snippet}`;
    })
    .filter((value): value is string => Boolean(value))
    .join("\n\n");

  const systemPrompt = `
Voce cria landings de alta conversao e sempre retorna JSON valido.

Regras obrigatorias:
1. Retorne APENAS JSON sem markdown.
2. Estrutura de saida:
{
  "name": string,
  "slug": string,
  "seoTitle": string,
  "seoDescription": string,
  "ogImageUrl": string,
  "faviconUrl": string,
  "content": {
    "theme": {
      "primaryColor": string,
      "secondaryColor": string,
      "accentColor": string,
      "backgroundColor": string,
      "foregroundColor": string
    },
    "sections": LandingBlock[]
  }
}
3. "sections" deve conter pelo menos os blocos: hero, benefits, features, howItWorks, testimonials, cta, faq, leadForm, footer.
4. Cada bloco deve respeitar os campos:
   - hero: id, type, eyebrow, title, subtitle, ctaLabel, ctaHref, secondaryLabel, secondaryHref, imageUrl, imageAlt
   - benefits/features: id, type, title, items[{title, description}]
   - howItWorks: id, type, title, steps[{title, description}]
   - testimonials: id, type, title, items[{quote, author, role}]
   - cta: id, type, title, description, ctaLabel, ctaHref
   - faq: id, type, title, items[{question, answer}]
   - leadForm: id, type, title, description, ctaLabel, successMessage
   - footer: id, type, companyName, copyrightText, links[{label, href}]
5. Cada id deve ser unico e com minimo 3 caracteres.
6. O conteudo deve ser consistente com o negocio informado, com copy objetiva e tom profissional.
7. Use portugues (pt-BR), exceto se o prompt pedir explicitamente outro idioma.
8. SEO:
   - seoTitle entre 50 e 65 caracteres.
   - seoDescription entre 120 e 160 caracteres.
9. Se nao houver favicon, retorne string vazia em "faviconUrl".
10. Se nao houver imagem OG, retorne string vazia em "ogImageUrl".
`.trim();

  const userPrompt = `
Prompt do cliente:
${params.prompt}

Arquivos anexados:
${attachmentSummary}

${extractedTextContext ? `Trechos extraidos de anexos textuais:\n${extractedTextContext}` : ""}

Use os anexos visuais para reforcar identidade visual, paleta e hierarquia da pagina.
`.trim();

  const userContent: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
    {
      type: "text",
      text: userPrompt,
    },
    ...imageAttachments.map((attachment) => ({
      type: "image_url" as const,
      image_url: {
        url: attachment.url,
      },
    })),
  ];

  const openAiBaseUrl = (env.OPENAI_BASE_URL ?? OPENAI_FALLBACK_BASE_URL).replace(/\/+$/, "");
  const response = await fetch(`${openAiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_LANDING_MODEL,
      temperature: 0.5,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    const message = payload?.error?.message ?? `Falha na chamada OpenAI (${response.status}).`;
    throw new Error(message);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const raw = payload.choices?.[0]?.message?.content;
  if (!raw || typeof raw !== "string") {
    throw new Error("A IA nao retornou conteudo para criar a landing.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    throw new Error("A IA retornou uma resposta invalida (nao-JSON).");
  }

  const parsed = aiGeneratedLandingSchema.safeParse(parsedJson);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(`A IA retornou um formato invalido: ${issue?.path.join(".") ?? "saida"} ${issue?.message ?? ""}`.trim());
  }

  return parsed.data;
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createPageWithAiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  await assertWorkspaceAccess(user.id, parsed.data.workspaceId, "editor");

  const uniqueAssetIds = [...new Set(parsed.data.attachments.map((attachment) => attachment.assetId))];
  const assets = uniqueAssetIds.length
    ? await db.asset.findMany({
        where: {
          workspaceId: parsed.data.workspaceId,
          id: {
            in: uniqueAssetIds,
          },
        },
        select: {
          id: true,
          url: true,
          mimeType: true,
          size: true,
        },
      })
    : [];

  if (assets.length !== uniqueAssetIds.length) {
    return NextResponse.json({ error: "Um ou mais anexos nao pertencem ao workspace ativo." }, { status: 400 });
  }

  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  const attachmentContext: AttachmentContext[] = [];
  for (const attachment of parsed.data.attachments) {
    const asset = assetsById.get(attachment.assetId);
    if (!asset) {
      return NextResponse.json({ error: "Anexo nao encontrado no workspace." }, { status: 400 });
    }

    attachmentContext.push({
      assetId: asset.id,
      url: asset.url,
      mimeType: asset.mimeType,
      size: asset.size,
      filename: attachment.filename,
    });
  }

  try {
    const generated = await generateLandingWithAi({
      prompt: sanitizeTextInput(parsed.data.prompt),
      attachments: attachmentContext,
    });

    const slug = await resolveAvailableSlug(parsed.data.workspaceId, generated.slug || generated.name);
    const page = await createLandingPage({
      workspaceId: parsed.data.workspaceId,
      userId: user.id,
      name: generated.name,
      slug,
      seoTitle: generated.seoTitle,
      seoDescription: generated.seoDescription,
      ogImageUrl: generated.ogImageUrl || null,
      faviconUrl: generated.faviconUrl || null,
      draftContent: generated.content,
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao gerar a landing com IA." },
      { status: 400 },
    );
  }
}
