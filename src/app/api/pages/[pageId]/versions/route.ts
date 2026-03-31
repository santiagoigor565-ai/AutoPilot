import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/server/api-auth";
import { db } from "@/lib/prisma";
import { assertWorkspaceAccess } from "@/lib/server/services/page-service";

export async function GET(_request: Request, context: { params: Promise<{ pageId: string }> }) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { pageId } = await context.params;

  const page = await db.landingPage.findUnique({
    where: { id: pageId },
  });

  if (!page) {
    return NextResponse.json({ error: "Página não encontrada." }, { status: 404 });
  }

  await assertWorkspaceAccess(user.id, page.workspaceId, "viewer");

  const versions = await db.pageVersion.findMany({
    where: {
      landingPageId: pageId,
    },
    include: {
      publishedBy: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      version: "desc",
    },
  });

  return NextResponse.json({ items: versions });
}

