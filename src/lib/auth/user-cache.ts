import type { MembershipRole, User } from "@prisma/client";

const SESSION_USER_CACHE_TTL_MS = 20_000;
const MAX_SESSION_USER_CACHE_SIZE = 400;

type CachedMembership = {
  id: string;
  workspaceId: string;
  role: MembershipRole;
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
};

export type CachedSessionUser = User & {
  memberships: CachedMembership[];
};

type SessionUserCacheEntry = {
  user: CachedSessionUser;
  expiresAt: number;
};

declare global {
  var __lfSessionUserCache: Map<string, SessionUserCacheEntry> | undefined;
}

function getStore() {
  if (!globalThis.__lfSessionUserCache) {
    globalThis.__lfSessionUserCache = new Map<string, SessionUserCacheEntry>();
  }

  return globalThis.__lfSessionUserCache;
}

function pruneStore(now: number) {
  const store = getStore();

  for (const [token, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(token);
    }
  }

  if (store.size <= MAX_SESSION_USER_CACHE_SIZE) {
    return;
  }

  const overflow = store.size - MAX_SESSION_USER_CACHE_SIZE;
  const sortedEntries = [...store.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt);

  for (let index = 0; index < overflow; index += 1) {
    const stale = sortedEntries[index];
    if (stale) {
      store.delete(stale[0]);
    }
  }
}

export function getCachedSessionUser(token: string) {
  const store = getStore();
  const now = Date.now();
  const entry = store.get(token);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= now) {
    store.delete(token);
    return null;
  }

  return entry.user;
}

export function setCachedSessionUser(token: string, user: CachedSessionUser) {
  const now = Date.now();
  const store = getStore();

  store.set(token, {
    user,
    expiresAt: now + SESSION_USER_CACHE_TTL_MS,
  });
  pruneStore(now);
}

export function invalidateSessionUserCacheByUserId(userId: string) {
  const store = getStore();
  for (const [token, entry] of store.entries()) {
    if (entry.user.id === userId) {
      store.delete(token);
    }
  }
}
