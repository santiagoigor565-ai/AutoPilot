import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { getAuthOnlyPage, isAuthOnlyModeEnabled, MOCK_PAGE_ID } from "@/lib/auth-only-mode";
import { requireUser } from "@/lib/auth/guards";
import { assertWorkspaceAccess } from "@/lib/server/services/page-service";
import { LandingPageEditor } from "@/components/builder/landing-page-editor";

export default async function EditLandingPagePage({ params }: { params: Promise<{ pageId: string }> }) {
  const user = await requireUser();
  const { pageId } = await params;

  if (isAuthOnlyModeEnabled() && pageId === MOCK_PAGE_ID) {
    const page = getAuthOnlyPage();
    return <LandingPageEditor page={page} />;
  }

  const page = await db.landingPage.findUnique({
    where: { id: pageId },
  });

  if (!page) {
    return notFound();
  }

  await assertWorkspaceAccess(user.id, page.workspaceId, "editor");

  const primaryDomain = await db.domain.findFirst({
    where: {
      workspaceId: page.workspaceId,
      isPrimary: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <LandingPageEditor
      page={{
        id: page.id,
        name: page.name,
        slug: page.slug,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        ogImageUrl: page.ogImageUrl,
        faviconUrl: page.faviconUrl,
        status: page.status,
        draftContent: page.draftContent,
        publicHost: primaryDomain?.host ?? null,
      }}
    />
  );
}
