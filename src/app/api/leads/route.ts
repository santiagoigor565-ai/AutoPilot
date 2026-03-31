import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/server/api-auth";
import { db } from "@/lib/prisma";
import { assertWorkspaceAccess } from "@/lib/server/services/page-service";

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

  const leads = await db.lead.findMany({
    where: { workspaceId },
    include: {
      landingPage: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json({ items: leads });
}

