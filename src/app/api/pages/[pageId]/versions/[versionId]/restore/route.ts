import { NextResponse } from "next/server";
import { isAuthOnlyModeEnabled, MOCK_PAGE_ID } from "@/lib/auth-only-mode";
import { getApiUser } from "@/lib/server/api-auth";
import { rollbackLandingPage } from "@/lib/server/services/page-service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ pageId: string; versionId: string }> },
) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { pageId, versionId } = await context.params;

  if (isAuthOnlyModeEnabled() && pageId === MOCK_PAGE_ID) {
    return NextResponse.json({ restored: { id: versionId, version: 1 }, mock: true }, { status: 201 });
  }

  try {
    const restored = await rollbackLandingPage({
      userId: user.id,
      pageId,
      versionId,
    });
    return NextResponse.json({ restored }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao restaurar versão." }, { status: 400 });
  }
}

