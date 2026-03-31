import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/server/api-auth";
import { db } from "@/lib/prisma";

export async function GET() {
  const user = await getApiUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Sem autorização." }, { status: 403 });
  }

  const workspaces = await db.workspace.findMany({
    include: {
      owner: {
        select: { id: true, email: true, name: true },
      },
      subscriptions: true,
      landingPages: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json({ items: workspaces });
}

