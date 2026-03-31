import { MembershipRole, User } from "@prisma/client";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { getSessionToken, verifySessionToken } from "@/lib/auth/session";
import { buildAuthOnlyUser, isAuthOnlyModeEnabled } from "@/lib/auth-only-mode";
import { getCachedSessionUser, setCachedSessionUser } from "@/lib/auth/user-cache";

const rolePriority: Record<MembershipRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export type AuthUser = User & {
  memberships: {
    workspaceId: string;
    role: MembershipRole;
    workspace: { id: string; name: string; slug: string };
  }[];
};

function includeMemberships() {
  return {
    memberships: {
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc" as const,
      },
    },
  };
}

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const token = await getSessionToken();
  if (!token) {
    return null;
  }

  const decoded = await verifySessionToken(token);
  if (!decoded?.uid || !decoded.email) {
    return null;
  }

  if (isAuthOnlyModeEnabled()) {
    return buildAuthOnlyUser(decoded);
  }

  const cachedUser = getCachedSessionUser(token);
  if (cachedUser && cachedUser.firebaseUid === decoded.uid) {
    return cachedUser;
  }

  const user = await db.user.findUnique({
    where: { firebaseUid: decoded.uid },
    include: includeMemberships(),
  });

  if (!user) {
    const created = await db.user.create({
      data: {
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name ?? null,
        avatarUrl: decoded.picture ?? null,
      },
      include: includeMemberships(),
    });

    setCachedSessionUser(token, created);
    return created;
  }

  const nextName = user.name ?? decoded.name ?? null;
  const nextAvatar = user.avatarUrl ?? decoded.picture ?? null;
  const shouldSyncProfile = user.email !== decoded.email || (user.name ?? null) !== nextName || (user.avatarUrl ?? null) !== nextAvatar;

  if (!shouldSyncProfile) {
    setCachedSessionUser(token, user);
    return user;
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      email: decoded.email,
      name: nextName,
      avatarUrl: nextAvatar,
    },
    include: includeMemberships(),
  });

  setCachedSessionUser(token, updated);
  return updated;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireWorkspaceRole(workspaceId: string, minimumRole: MembershipRole = "viewer") {
  const user = await requireUser();
  const membership = user.memberships.find((item) => item.workspaceId === workspaceId);

  if (!membership || rolePriority[membership.role] < rolePriority[minimumRole]) {
    redirect("/app");
  }

  return { user, membership };
}

export function canManageWorkspace(role: MembershipRole) {
  return role === "owner" || role === "admin";
}
