import { NextResponse } from "next/server";
import { SubscriptionStatus } from "@prisma/client";
import { getApiUser } from "@/lib/server/api-auth";
import { db } from "@/lib/prisma";
import { assertWorkspaceAccess } from "@/lib/server/services/page-service";
import { getBillingProvider } from "@/lib/billing";

export async function GET(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId é obrigatório." }, { status: 400 });
  }

  await assertWorkspaceAccess(user.id, workspaceId, "viewer");
  const billing = getBillingProvider();
  const snapshot = await billing.getWorkspaceSubscription(workspaceId);
  return NextResponse.json({ subscription: snapshot });
}

export async function PATCH(request: Request) {
  const user = await getApiUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Sem autorização." }, { status: 403 });
  }

  const body = (await request.json()) as { workspaceId?: string; status?: SubscriptionStatus; planCode?: string };
  if (!body.workspaceId || !body.status) {
    return NextResponse.json({ error: "workspaceId e status são obrigatórios." }, { status: 400 });
  }

  const updated = await db.subscription.upsert({
    where: { workspaceId: body.workspaceId },
    create: {
      workspaceId: body.workspaceId,
      status: body.status,
      planCode: body.planCode ?? "starter",
      updatedByAdminId: user.id,
    },
    update: {
      status: body.status,
      planCode: body.planCode ?? undefined,
      updatedByAdminId: user.id,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: user.id,
      workspaceId: body.workspaceId,
      action: "subscription.status_changed",
      entityType: "Subscription",
      entityId: updated.id,
      metadata: {
        status: updated.status,
      },
    },
  });

  return NextResponse.json({ subscription: updated });
}

