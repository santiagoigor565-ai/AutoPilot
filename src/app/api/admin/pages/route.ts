import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/server/api-auth";
import { db } from "@/lib/prisma";

export async function GET() {
  const user = await getApiUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Sem autorização." }, { status: 403 });
  }

  const pages = await db.landingPage.findMany({
    include: {
      workspace: {
        select: { id: true, name: true, slug: true },
      },
      publishedVersion: {
        select: {
          id: true,
          version: true,
          publishedAt: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });

  return NextResponse.json({ items: pages });
}

