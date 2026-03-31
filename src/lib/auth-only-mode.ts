import type { DecodedIdToken } from "firebase-admin/auth";
import type { AuthUser } from "@/lib/auth/guards";
import { env } from "@/lib/env";
import { createDefaultLandingContent, parseLandingContent } from "@/types/builder";
import { slugify } from "@/lib/utils";

export const MOCK_USER_ID = "auth-only-user";
export const MOCK_WORKSPACE_ID = "auth-only-workspace";
export const MOCK_PAGE_ID = "mock";

type AuthOnlyPage = {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string | null;
  faviconUrl: string | null;
  status: "draft";
  draftContent: unknown;
  publicHost: string;
};

type AuthOnlyPageSettingsPatch = Partial<
  Pick<AuthOnlyPage, "name" | "slug" | "seoTitle" | "seoDescription" | "ogImageUrl" | "faviconUrl">
>;

type AuthOnlyProfileState = {
  name: string | null;
  avatarUrl: string | null;
};

function createAuthOnlyDefaultPage(): AuthOnlyPage {
  return {
    id: MOCK_PAGE_ID,
    workspaceId: MOCK_WORKSPACE_ID,
    name: "Landing local de teste",
    slug: "landing-local",
    seoTitle: "Landing local",
    seoDescription: "Modo local sem banco para explorar a area logada.",
    ogImageUrl: null,
    faviconUrl: null,
    status: "draft",
    draftContent: createDefaultLandingContent(),
    publicHost: "workspace-local.localhost",
  };
}

type AuthOnlyRuntimeState = {
  page: AuthOnlyPage;
  profile: AuthOnlyProfileState;
};

declare global {
  var __lfAuthOnlyState: AuthOnlyRuntimeState | undefined;
}

function getAuthOnlyRuntimeState(): AuthOnlyRuntimeState {
  if (!globalThis.__lfAuthOnlyState) {
    globalThis.__lfAuthOnlyState = {
      page: createAuthOnlyDefaultPage(),
      profile: {
        name: null,
        avatarUrl: null,
      },
    };
  }

  return globalThis.__lfAuthOnlyState;
}

export function isAuthOnlyModeEnabled() {
  return env.ENABLE_AUTH_ONLY_MODE;
}

export function buildAuthOnlyUser(decoded: DecodedIdToken): AuthUser {
  const state = getAuthOnlyRuntimeState();

  return {
    id: MOCK_USER_ID,
    firebaseUid: decoded.uid,
    email: decoded.email ?? "user@example.com",
    name: state.profile.name ?? decoded.name ?? "Usuario local",
    avatarUrl: state.profile.avatarUrl ?? decoded.picture ?? null,
    isSuperAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    memberships: [
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
  };
}

export function buildAuthOnlyApiUser(decoded: DecodedIdToken) {
  const state = getAuthOnlyRuntimeState();

  return {
    id: MOCK_USER_ID,
    firebaseUid: decoded.uid,
    email: decoded.email ?? "user@example.com",
    name: state.profile.name ?? decoded.name ?? "Usuario local",
    avatarUrl: state.profile.avatarUrl ?? decoded.picture ?? null,
    isSuperAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    memberships: [
      {
        id: "auth-only-membership",
        userId: MOCK_USER_ID,
        workspaceId: MOCK_WORKSPACE_ID,
        role: "owner" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };
}

export function getAuthOnlyPage() {
  const state = getAuthOnlyRuntimeState();

  return {
    ...state.page,
    draftContent: parseLandingContent(state.page.draftContent),
  };
}

export function updateAuthOnlyPageDraft(params: { draftContent: unknown; settings?: AuthOnlyPageSettingsPatch }) {
  const state = getAuthOnlyRuntimeState();
  const nextSlug = params.settings?.slug ? slugify(params.settings.slug) : state.page.slug;

  state.page = {
    ...state.page,
    name: params.settings?.name ?? state.page.name,
    slug: nextSlug || state.page.slug,
    seoTitle: params.settings?.seoTitle ?? state.page.seoTitle,
    seoDescription: params.settings?.seoDescription ?? state.page.seoDescription,
    ogImageUrl:
      params.settings?.ogImageUrl === ""
        ? null
        : params.settings?.ogImageUrl === undefined
          ? state.page.ogImageUrl
          : params.settings.ogImageUrl,
    faviconUrl:
      params.settings?.faviconUrl === ""
        ? null
        : params.settings?.faviconUrl === undefined
          ? state.page.faviconUrl
          : params.settings.faviconUrl,
    draftContent: parseLandingContent(params.draftContent),
  };

  return getAuthOnlyPage();
}

export function updateAuthOnlyUserProfile(params: { name?: string | null; avatarUrl?: string | null }) {
  const state = getAuthOnlyRuntimeState();

  state.profile = {
    name: params.name === undefined ? state.profile.name : params.name,
    avatarUrl: params.avatarUrl === undefined ? state.profile.avatarUrl : params.avatarUrl,
  };

  return state.profile;
}
