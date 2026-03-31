import { NextResponse } from "next/server";
import { isAuthOnlyModeEnabled, MOCK_PAGE_ID } from "@/lib/auth-only-mode";
import { getApiUser } from "@/lib/server/api-auth";
import { publishLandingPage } from "@/lib/server/services/page-service";

export async function POST(_request: Request, context: { params: Promise<{ pageId: string }> }) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { pageId } = await context.params;

  if (isAuthOnlyModeEnabled() && pageId === MOCK_PAGE_ID) {
    return NextResponse.json({ version: { id: "mock-version-1", version: 1 }, mock: true }, { status: 201 });
  }

  try {
    const version = await publishLandingPage({
      userId: user.id,
      pageId,
    });
    return NextResponse.json({ version }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao publicar." }, { status: 400 });
  }
}

