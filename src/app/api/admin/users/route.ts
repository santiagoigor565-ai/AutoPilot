import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/server/api-auth";
import { db } from "@/lib/prisma";

export async function GET() {
  const user = await getApiUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Sem autorização." }, { status: 403 });
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      memberships: {
        include: {
          workspace: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
    take: 500,
  });

  return NextResponse.json({ items: users });
}

