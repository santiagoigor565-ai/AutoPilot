import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { getApiUser } from "@/lib/server/api-auth";
import { assertWorkspaceAccess } from "@/lib/server/services/page-service";

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(request: Request, context: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await context.params;
  const body = await request.json();
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  const page = await db.landingPage.findUnique({
    where: { id: pageId },
    select: { id: true, workspaceId: true, status: true },
  });

  if (!page) {
    return NextResponse.json({ error: "Pagina nao encontrada." }, { status: 404 });
  }

  if (page.status !== "published") {
    return NextResponse.json({ error: "A pagina ainda nao esta publicada." }, { status: 409 });
  }

  const subscription = await db.subscription.findUnique({
    where: { workspaceId: page.workspaceId },
    select: { status: true },
  });

  if (subscription && ["past_due", "canceled", "paused", "suspended"].includes(subscription.status)) {
    return NextResponse.json({ error: "Captura indisponivel para este workspace." }, { status: 403 });
  }

  const userAgent = request.headers.get("user-agent") ?? undefined;
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const referrer = request.headers.get("referer") ?? undefined;

  const lead = await db.lead.create({
    data: {
      workspaceId: page.workspaceId,
      landingPageId: page.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      company: parsed.data.company,
      message: parsed.data.message,
      payload: parsed.data,
      sourceUrl: referrer,
      userAgent,
      ipAddress: forwardedFor,
    },
  });

  return NextResponse.json({ lead }, { status: 201 });
}

export async function GET(_request: Request, context: { params: Promise<{ pageId: string }> }) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { pageId } = await context.params;
  const page = await db.landingPage.findUnique({
    where: { id: pageId },
  });

  if (!page) {
    return NextResponse.json({ error: "Pagina nao encontrada." }, { status: 404 });
  }

  await assertWorkspaceAccess(user.id, page.workspaceId, "viewer");

  const leads = await db.lead.findMany({
    where: { landingPageId: pageId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ items: leads });
}
