import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthOnlyModeEnabled, MOCK_USER_ID, updateAuthOnlyUserProfile } from "@/lib/auth-only-mode";
import { db } from "@/lib/prisma";
import { getApiUser } from "@/lib/server/api-auth";
import { invalidateSessionUserCacheByUserId } from "@/lib/auth/user-cache";

const profilePatchSchema = z
  .object({
    name: z.string().trim().min(2).max(120).nullable().optional(),
    avatarUrl: z.string().trim().max(2_000_000).nullable().optional(),
  })
  .refine((payload) => payload.name !== undefined || payload.avatarUrl !== undefined, {
    message: "Nenhum campo para atualizar.",
  });

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      firebaseUid: user.firebaseUid,
    },
  });
}

export async function PATCH(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalido." }, { status: 400 });
  }

  const updateData: {
    name?: string | null;
    avatarUrl?: string | null;
  } = {};

  if (Object.hasOwn(parsed.data, "name")) {
    updateData.name = parsed.data.name;
  }

  if (Object.hasOwn(parsed.data, "avatarUrl")) {
    const raw = parsed.data.avatarUrl;
    updateData.avatarUrl = raw && raw.length > 0 ? raw : null;
  }

  if (isAuthOnlyModeEnabled() && user.id === MOCK_USER_ID) {
    const profile = updateAuthOnlyUserProfile(updateData);
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firebaseUid: user.firebaseUid,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      },
      mock: true,
    });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firebaseUid: true,
      name: true,
      avatarUrl: true,
    },
  });

  invalidateSessionUserCacheByUserId(user.id);

  return NextResponse.json({ user: updated });
}
