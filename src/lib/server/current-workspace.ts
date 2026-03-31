import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/auth/guards";
import { env } from "@/lib/env";

export const ACTIVE_WORKSPACE_COOKIE = "lf_workspace";

function getCookieDomain() {
  const rootDomain = env.ROOT_DOMAIN.split(":")[0]?.toLowerCase() ?? "localhost";
  if (rootDomain === "localhost" || !rootDomain.includes(".")) {
    return undefined;
  }

  return rootDomain.startsWith(".") ? rootDomain : `.${rootDomain}`;
}

function getWorkspaceCookieOptions() {
  const domain = getCookieDomain();

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    ...(domain ? { domain } : {}),
  };
}

export function resolveActiveMembership(user: AuthUser, workspaceId?: string | null) {
  if (workspaceId) {
    const byParam = user.memberships.find((membership) => membership.workspaceId === workspaceId);
    if (byParam) {
      return byParam;
    }
  }

  return user.memberships[0] ?? null;
}

export async function getActiveWorkspaceId() {
  const store = await cookies();
  return store.get(ACTIVE_WORKSPACE_COOKIE)?.value ?? null;
}

export async function getActiveMembership(user: AuthUser, workspaceId?: string | null) {
  const preferredWorkspaceId = workspaceId ?? (await getActiveWorkspaceId());
  return resolveActiveMembership(user, preferredWorkspaceId);
}

export async function setActiveWorkspaceCookie(workspaceId: string) {
  const store = await cookies();
  store.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, getWorkspaceCookieOptions());
}

export async function clearActiveWorkspaceCookie() {
  const store = await cookies();
  store.set(ACTIVE_WORKSPACE_COOKIE, "", {
    ...getWorkspaceCookieOptions(),
    maxAge: 0,
  });
}
