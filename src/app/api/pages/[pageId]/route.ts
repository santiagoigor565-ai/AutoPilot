import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAuthOnlyPage, isAuthOnlyModeEnabled, MOCK_PAGE_ID, updateAuthOnlyPageDraft } from "@/lib/auth-only-mode";
import { getApiUser } from "@/lib/server/api-auth";
import { db } from "@/lib/prisma";
import { draftUpdateSchema } from "@/lib/validators/page";
import { assertWorkspaceAccess } from "@/lib/server/services/page-service";
import { slugify } from "@/lib/utils";

export async function GET(_request: Request, context: { params: Promise<{ pageId: string }> }) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { pageId } = await context.params;
  if (isAuthOnlyModeEnabled() && pageId === MOCK_PAGE_ID) {
    return NextResponse.json({ page: getAuthOnlyPage() });
  }

  const page = await db.landingPage.findUnique({
    where: { id: pageId },
  });

  if (!page) {
    return NextResponse.json({ error: "Página não encontrada." }, { status: 404 });
  }

  await assertWorkspaceAccess(user.id, page.workspaceId, "viewer");
  return NextResponse.json({ page });
}

export async function PATCH(request: Request, context: { params: Promise<{ pageId: string }> }) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { pageId } = await context.params;
  if (isAuthOnlyModeEnabled() && pageId === MOCK_PAGE_ID) {
    const body = await request.json();
    const parsed = draftUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
    }

    const page = updateAuthOnlyPageDraft({
      draftContent: parsed.data.draftContent,
      settings: {
        name: parsed.data.settings?.name,
        slug: parsed.data.settings?.slug,
        seoTitle: parsed.data.settings?.seoTitle,
        seoDescription: parsed.data.settings?.seoDescription,
        ogImageUrl: parsed.data.settings?.ogImageUrl,
        faviconUrl: parsed.data.settings?.faviconUrl,
      },
    });

    return NextResponse.json({
      page: {
        ...page,
        draftContent: page.draftContent as Prisma.InputJsonValue,
      },
      mock: true,
    });
  }

  const page = await db.landingPage.findUnique({
    where: { id: pageId },
  });

  if (!page) {
    return NextResponse.json({ error: "Página não encontrada." }, { status: 404 });
  }

  await assertWorkspaceAccess(user.id, page.workspaceId, "editor");

  const body = await request.json();
  const parsed = draftUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const slug = parsed.data.settings?.slug ? slugify(parsed.data.settings.slug) : page.slug;
  if (!slug) {
    return NextResponse.json({ error: "Slug inválido." }, { status: 400 });
  }

  try {
    const updated = await db.landingPage.update({
      where: { id: page.id },
      data: {
        name: parsed.data.settings?.name ?? page.name,
        slug,
        seoTitle: parsed.data.settings?.seoTitle ?? page.seoTitle,
        seoDescription: parsed.data.settings?.seoDescription ?? page.seoDescription,
        ogImageUrl: parsed.data.settings?.ogImageUrl === "" ? null : parsed.data.settings?.ogImageUrl ?? page.ogImageUrl,
        faviconUrl: parsed.data.settings?.faviconUrl === "" ? null : parsed.data.settings?.faviconUrl ?? page.faviconUrl,
        draftContent: parsed.data.draftContent as Prisma.InputJsonValue,
        status: page.status === "published" ? "published" : "draft",
      },
    });

    await db.auditLog.create({
      data: {
        workspaceId: page.workspaceId,
        actorId: user.id,
        action: "landing_page.draft_updated",
        entityType: "LandingPage",
        entityId: page.id,
      },
    });

    return NextResponse.json({ page: updated });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao atualizar draft." }, { status: 400 });
  }
}

