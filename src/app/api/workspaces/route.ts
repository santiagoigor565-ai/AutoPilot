import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthOnlyModeEnabled, MOCK_WORKSPACE_ID } from "@/lib/auth-only-mode";
import { getApiUser } from "@/lib/server/api-auth";
import { db } from "@/lib/prisma";
import { setActiveWorkspaceCookie } from "@/lib/server/current-workspace";
import { createWorkspaceForUser } from "@/lib/server/services/workspace-service";

const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(120),
});

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  if (isAuthOnlyModeEnabled()) {
    return NextResponse.json({
      items: [
        {
          workspaceId: MOCK_WORKSPACE_ID,
          role: "owner",
          workspace: {
            id: MOCK_WORKSPACE_ID,
            name: "Workspace Local",
            slug: "workspace-local",
          },
        },
      ],
    });
  }

  const workspaces = await db.membership.findMany({
    where: {
      userId: user.id,
    },
    include: {
      workspace: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json({
    items: workspaces.map((membership) => ({
      workspaceId: membership.workspaceId,
      role: membership.role,
      workspace: membership.workspace,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  if (isAuthOnlyModeEnabled()) {
    return NextResponse.json({ error: "Criacao de workspace indisponivel no modo local sem banco." }, { status: 409 });
  }

  const body = await request.json();
  const parsed = createWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  const workspace = await createWorkspaceForUser({
    userId: user.id,
    name: parsed.data.name,
  });

  await setActiveWorkspaceCookie(workspace.id);
  return NextResponse.json({ workspace }, { status: 201 });
}
