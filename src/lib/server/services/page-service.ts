import { MembershipRole, Prisma, PagePublicationStatus } from "@prisma/client";
import { MOCK_WORKSPACE_ID, isAuthOnlyModeEnabled } from "@/lib/auth-only-mode";
import { db } from "@/lib/prisma";
import { env } from "@/lib/env";
import { getBillingProvider } from "@/lib/billing";
import { landingContentSchema, parseLandingContent } from "@/types/builder";
import { slugify } from "@/lib/utils";

const rolePriority: Record<MembershipRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export function hasRole(role: MembershipRole, minimum: MembershipRole) {
  return rolePriority[role] >= rolePriority[minimum];
}

export async function assertWorkspaceAccess(userId: string, workspaceId: string, minimumRole: MembershipRole = "viewer") {
  if (isAuthOnlyModeEnabled() && workspaceId === MOCK_WORKSPACE_ID) {
    return {
      id: "auth-only-membership",
      userId,
      workspaceId,
      role: "owner" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const membership = await db.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
  });

  if (!membership || !hasRole(membership.role, minimumRole)) {
    throw new Error("Sem permissao para acessar este workspace.");
  }

  return membership;
}

function getWorkspaceHost(slug: string) {
  const rootDomain = env.ROOT_DOMAIN.split(":")[0]?.toLowerCase() ?? "localhost";
  return `${slug}.${rootDomain}`;
}

async function ensurePrimaryDomain(tx: Prisma.TransactionClient, params: { workspaceId: string; workspaceSlug: string; landingPageId: string }) {
  const primaryDomain = await tx.domain.findFirst({
    where: {
      workspaceId: params.workspaceId,
      isPrimary: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!primaryDomain) {
    return tx.domain.create({
      data: {
        workspaceId: params.workspaceId,
        landingPageId: params.landingPageId,
        host: getWorkspaceHost(params.workspaceSlug),
        type: "subdomain",
        status: "active",
        isPrimary: true,
      },
    });
  }

  return tx.domain.update({
    where: { id: primaryDomain.id },
    data: {
      host: primaryDomain.host || getWorkspaceHost(params.workspaceSlug),
      landingPageId: params.landingPageId,
      status: primaryDomain.status === "disabled" ? "active" : primaryDomain.status,
    },
  });
}

export async function createLandingPage(params: {
  workspaceId: string;
  name: string;
  slug: string;
  userId: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string | null;
  faviconUrl?: string | null;
  draftContent: Prisma.InputJsonValue;
}) {
  await assertWorkspaceAccess(params.userId, params.workspaceId, "editor");

  const normalizedSlug = slugify(params.slug);
  if (!normalizedSlug) {
    throw new Error("Slug invalido.");
  }

  const contentValidation = landingContentSchema.safeParse(params.draftContent);
  if (!contentValidation.success) {
    throw new Error("Conteudo inicial invalido.");
  }

  const workspace = await db.workspace.findUnique({
    where: { id: params.workspaceId },
    select: { slug: true },
  });

  return db.landingPage.create({
    data: {
      workspaceId: params.workspaceId,
      name: params.name,
      slug: normalizedSlug,
      siteSubdomain: workspace?.slug,
      seoTitle: params.seoTitle?.trim() || params.name,
      seoDescription: params.seoDescription?.trim() || "Landing page criada no AutoPilot.com.",
      ogImageUrl: params.ogImageUrl?.trim() || null,
      faviconUrl: params.faviconUrl?.trim() || null,
      draftContent: contentValidation.data,
      status: "draft",
      createdById: params.userId,
    },
  });
}

export async function publishLandingPage(params: { userId: string; pageId: string }) {
  const page = await db.landingPage.findUnique({
    where: { id: params.pageId },
    include: {
      workspace: {
        select: {
          id: true,
          slug: true,
        },
      },
      versions: {
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!page) {
    throw new Error("Pagina nao encontrada.");
  }

  await assertWorkspaceAccess(params.userId, page.workspaceId, "editor");

  const parsedContent = parseLandingContent(page.draftContent);
  const validation = landingContentSchema.safeParse(parsedContent);
  if (!validation.success) {
    throw new Error("Conteudo do draft invalido para publicacao.");
  }

  const billing = getBillingProvider();
  const allowance = await billing.canPublish(page.workspaceId);
  if (!allowance.allowed) {
    throw new Error(allowance.reason ?? "Publicacao bloqueada por status do plano.");
  }

  const lastVersion = page.versions[0]?.version ?? 0;
  const nextVersion = lastVersion + 1;

  const { version } = await db.$transaction(async (tx) => {
    const createdVersion = await tx.pageVersion.create({
      data: {
        workspaceId: page.workspaceId,
        landingPageId: page.id,
        version: nextVersion,
        content: validation.data,
        publishedById: params.userId,
      },
    });

    await tx.landingPage.update({
      where: { id: page.id },
      data: {
        publishedVersionId: createdVersion.id,
        status: PagePublicationStatus.published,
        siteSubdomain: page.workspace.slug,
      },
    });

    await ensurePrimaryDomain(tx, {
      workspaceId: page.workspaceId,
      workspaceSlug: page.workspace.slug,
      landingPageId: page.id,
    });

    await tx.auditLog.create({
      data: {
        workspaceId: page.workspaceId,
        actorId: params.userId,
        action: "landing_page.published",
        entityType: "LandingPage",
        entityId: page.id,
        metadata: {
          version: nextVersion,
        },
      },
    });

    return { version: createdVersion };
  });

  return version;
}

export async function rollbackLandingPage(params: { userId: string; pageId: string; versionId: string }) {
  const version = await db.pageVersion.findUnique({
    where: { id: params.versionId },
    include: {
      landingPage: {
        include: {
          workspace: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!version || version.landingPageId !== params.pageId) {
    throw new Error("Versao nao encontrada.");
  }

  await assertWorkspaceAccess(params.userId, version.workspaceId, "editor");

  const billing = getBillingProvider();
  const allowance = await billing.canPublish(version.workspaceId);
  if (!allowance.allowed) {
    throw new Error(allowance.reason ?? "Publicacao bloqueada por status do plano.");
  }

  const latestVersion = await db.pageVersion.findFirst({
    where: {
      landingPageId: version.landingPageId,
    },
    orderBy: {
      version: "desc",
    },
  });

  const nextVersion = (latestVersion?.version ?? 0) + 1;
  const rollbackContent = version.content === null ? Prisma.JsonNull : (version.content as Prisma.InputJsonValue);

  const restored = await db.$transaction(async (tx) => {
    const createdVersion = await tx.pageVersion.create({
      data: {
        workspaceId: version.workspaceId,
        landingPageId: version.landingPageId,
        version: nextVersion,
        content: rollbackContent,
        publishedById: params.userId,
        isRollback: true,
      },
    });

    await tx.landingPage.update({
      where: { id: version.landingPageId },
      data: {
        draftContent: rollbackContent,
        publishedVersionId: createdVersion.id,
        status: "published",
        siteSubdomain: version.landingPage.workspace.slug,
      },
    });

    await ensurePrimaryDomain(tx, {
      workspaceId: version.workspaceId,
      workspaceSlug: version.landingPage.workspace.slug,
      landingPageId: version.landingPageId,
    });

    await tx.auditLog.create({
      data: {
        workspaceId: version.workspaceId,
        actorId: params.userId,
        action: "landing_page.rollback",
        entityType: "LandingPage",
        entityId: version.landingPageId,
        metadata: {
          sourceVersion: version.version,
          promotedVersion: nextVersion,
        },
      },
    });

    return createdVersion;
  });

  return restored;
}
