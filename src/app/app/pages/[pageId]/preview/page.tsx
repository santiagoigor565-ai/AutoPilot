import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { getAuthOnlyPage, isAuthOnlyModeEnabled, MOCK_PAGE_ID } from "@/lib/auth-only-mode";
import { requireUser } from "@/lib/auth/guards";
import { assertWorkspaceAccess } from "@/lib/server/services/page-service";
import { parseLandingContent } from "@/types/builder";
import { LandingRenderer } from "@/components/landing/landing-renderer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PreviewLandingPage({ params }: { params: Promise<{ pageId: string }> }) {
  const user = await requireUser();
  const { pageId } = await params;

  if (isAuthOnlyModeEnabled() && pageId === MOCK_PAGE_ID) {
    const page = getAuthOnlyPage();
    return (
      <div className="rounded-xl border border-border bg-white">
        <LandingRenderer content={parseLandingContent(page.draftContent)} pageId={page.id} mode="preview" />
      </div>
    );
  }

  const page = await db.landingPage.findUnique({
    where: { id: pageId },
  });

  if (!page) {
    return notFound();
  }

  await assertWorkspaceAccess(user.id, page.workspaceId, "viewer");

  return (
    <div className="rounded-xl border border-border bg-white">
      <LandingRenderer content={parseLandingContent(page.draftContent)} pageId={page.id} mode="preview" />
    </div>
  );
}
