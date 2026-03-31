import { NextResponse } from "next/server";
import { createPageSchema } from "@/lib/validators/page";
import { getApiUser } from "@/lib/server/api-auth";
import { db } from "@/lib/prisma";
import { createDefaultLandingContent } from "@/types/builder";
import { assertWorkspaceAccess, createLandingPage } from "@/lib/server/services/page-service";

export async function GET(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId é obrigatório." }, { status: 400 });
  }

  await assertWorkspaceAccess(user.id, workspaceId, "viewer");

  const pages = await db.landingPage.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
    include: {
      publishedVersion: {
        select: {
          id: true,
          version: true,
          publishedAt: true,
        },
      },
    },
  });

  return NextResponse.json({ items: pages });
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createPageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  try {
    const page = await createLandingPage({
      workspaceId: parsed.data.workspaceId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      userId: user.id,
      draftContent: createDefaultLandingContent(),
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao criar página." }, { status: 400 });
  }
}

