import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/server/api-auth";
import { db } from "@/lib/prisma";

export async function POST(_request: Request, context: { params: Promise<{ pageId: string }> }) {
  const user = await getApiUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Sem autorização." }, { status: 403 });
  }

  const { pageId } = await context.params;
  const page = await db.landingPage.findUnique({
    where: { id: pageId },
  });

  if (!page) {
    return NextResponse.json({ error: "Página não encontrada." }, { status: 404 });
  }

  const updated = await db.landingPage.update({
    where: { id: page.id },
    data: { status: "suspended" },
  });

  await db.auditLog.create({
    data: {
      actorId: user.id,
      workspaceId: page.workspaceId,
      action: "landing_page.suspended_by_admin",
      entityType: "LandingPage",
      entityId: page.id,
    },
  });

  return NextResponse.json({ page: updated });
}

