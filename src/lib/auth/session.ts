import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";
import { env } from "@/lib/env";
import { getFirebaseAdminAuth } from "@/lib/auth/firebase-admin";

const SESSION_COOKIE = "lf_session";
const SESSION_VERIFY_CACHE_TTL_MS = 60_000;
const MAX_TOKEN_CACHE_SIZE = 500;

type CachedToken = {
  decoded: DecodedIdToken;
  expiresAt: number;
};

const tokenVerificationCache = new Map<string, CachedToken>();

function getCookieDomain() {
  const rootDomain = env.ROOT_DOMAIN.split(":")[0]?.toLowerCase() ?? "localhost";
  if (rootDomain === "localhost" || !rootDomain.includes(".")) {
    return undefined;
  }

  return rootDomain.startsWith(".") ? rootDomain : `.${rootDomain}`;
}

function getSessionCookieOptions() {
  const domain = getCookieDomain();

  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 5,
    ...(domain ? { domain } : {}),
  };
}

export async function setSessionCookie(idToken: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, idToken, getSessionCookieOptions());
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
}

export async function getSessionToken() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

function pruneTokenCache(now: number) {
  for (const [token, cached] of tokenVerificationCache.entries()) {
    if (cached.expiresAt <= now) {
      tokenVerificationCache.delete(token);
    }
  }

  if (tokenVerificationCache.size <= MAX_TOKEN_CACHE_SIZE) {
    return;
  }

  const overflow = tokenVerificationCache.size - MAX_TOKEN_CACHE_SIZE;
  const entries = [...tokenVerificationCache.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt);
  for (let index = 0; index < overflow; index += 1) {
    const entry = entries[index];
    if (entry) {
      tokenVerificationCache.delete(entry[0]);
    }
  }
}

export async function verifySessionToken(token: string): Promise<DecodedIdToken | null> {
  const now = Date.now();
  const cached = tokenVerificationCache.get(token);
  if (cached && cached.expiresAt > now) {
    return cached.decoded;
  }

  try {
    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(token);
    const tokenExpMs = typeof decoded.exp === "number" ? decoded.exp * 1000 : now + SESSION_VERIFY_CACHE_TTL_MS;
    const expiresAt = Math.min(now + SESSION_VERIFY_CACHE_TTL_MS, tokenExpMs);

    tokenVerificationCache.set(token, {
      decoded,
      expiresAt,
    });
    pruneTokenCache(now);
    return decoded;
  } catch {
    tokenVerificationCache.delete(token);
    return null;
  }
}
