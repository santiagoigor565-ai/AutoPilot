import { db } from "@/lib/prisma";
import { getHostWithoutPort } from "@/lib/tenant";

export async function resolvePublishedPageByHost(host: string | null | undefined, slug?: string) {
  const cleanHost = getHostWithoutPort(host);
  if (!cleanHost) {
    return null;
  }

  const domain = await db.domain.findFirst({
    where: {
      host: cleanHost,
      status: "active",
    },
    select: {
      workspaceId: true,
      landingPageId: true,
    },
  });

  if (!domain) {
    return null;
  }

  const subscription = await db.subscription.findUnique({
    where: { workspaceId: domain.workspaceId },
    select: { status: true },
  });

  if (subscription && ["past_due", "canceled", "paused", "suspended"].includes(subscription.status)) {
    return null;
  }

  if (!slug && domain.landingPageId) {
    const primaryPage = await db.landingPage.findFirst({
      where: {
        id: domain.landingPageId,
        workspaceId: domain.workspaceId,
        status: "published",
      },
      include: {
        publishedVersion: true,
      },
    });

    if (primaryPage?.publishedVersion) {
      return primaryPage;
    }
  }

  const page = await db.landingPage.findFirst({
    where: {
      workspaceId: domain.workspaceId,
      status: "published",
      ...(slug ? { slug } : {}),
    },
    include: {
      publishedVersion: true,
    },
    orderBy: slug ? undefined : { updatedAt: "desc" },
  });

  if (!page?.publishedVersion) {
    return null;
  }

  return page;
}
