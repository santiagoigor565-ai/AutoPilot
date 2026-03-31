import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { isAuthOnlyModeEnabled, MOCK_WORKSPACE_ID } from "@/lib/auth-only-mode";
import { getFirebaseAdminAuth } from "@/lib/auth/firebase-admin";
import { setSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/prisma";
import { setActiveWorkspaceCookie } from "@/lib/server/current-workspace";
import { createWorkspaceForUser } from "@/lib/server/services/workspace-service";

const sessionBodySchema = z.object({
  idToken: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sessionBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
    }

    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(parsed.data.idToken);

    if (!decoded.email) {
      return NextResponse.json({ error: "Token sem e-mail." }, { status: 401 });
    }

    if (env.REQUIRE_EMAIL_VERIFICATION && decoded.email_verified !== true) {
      return NextResponse.json({ error: "Verifique seu e-mail antes de entrar." }, { status: 403 });
    }

    if (isAuthOnlyModeEnabled()) {
      await setActiveWorkspaceCookie(MOCK_WORKSPACE_ID);
      await setSessionCookie(parsed.data.idToken);
      return NextResponse.json({ success: true, mode: "auth-only" });
    }

    const user = await db.user.upsert({
      where: { firebaseUid: decoded.uid },
      update: {
        email: decoded.email,
        name: decoded.name ?? undefined,
        avatarUrl: decoded.picture ?? undefined,
      },
      create: {
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name ?? undefined,
        avatarUrl: decoded.picture ?? undefined,
      },
      include: {
        memberships: true,
      },
    });

    let activeWorkspaceId = user.memberships[0]?.workspaceId ?? null;

    if (user.memberships.length === 0) {
      const workspace = await createWorkspaceForUser({
        userId: user.id,
        name: "Meu Workspace",
      });

      activeWorkspaceId = workspace.id;
    }

    if (activeWorkspaceId) {
      await setActiveWorkspaceCookie(activeWorkspaceId);
    }

    await setSessionCookie(parsed.data.idToken);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel abrir sessao." },
      { status: 401 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
