import { NextResponse } from "next/server";
import { z } from "zod";
import { SubscriptionStatus } from "@prisma/client";
import { getApiUser } from "@/lib/server/api-auth";
import { db } from "@/lib/prisma";

const bodySchema = z.object({
  status: z.nativeEnum(SubscriptionStatus),
  planCode: z.string().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ workspaceId: string }> }) {
  const user = await getApiUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Sem autorização." }, { status: 403 });
  }

  const { workspaceId } = await context.params;
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const subscription = await db.subscription.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      status: parsed.data.status,
      planCode: parsed.data.planCode ?? "starter",
      updatedByAdminId: user.id,
    },
    update: {
      status: parsed.data.status,
      planCode: parsed.data.planCode ?? undefined,
      updatedByAdminId: user.id,
      pausedAt: parsed.data.status === "paused" ? new Date() : null,
      canceledAt: parsed.data.status === "canceled" ? new Date() : null,
    },
  });

  await db.auditLog.create({
    data: {
      workspaceId,
      actorId: user.id,
      action: "subscription.admin_update",
      entityType: "Subscription",
      entityId: subscription.id,
      metadata: {
        status: subscription.status,
      },
    },
  });

  if (subscription.status === "suspended") {
    await db.landingPage.updateMany({
      where: { workspaceId, status: "published" },
      data: { status: "suspended" },
    });
  }

  return NextResponse.json({ subscription });
}

