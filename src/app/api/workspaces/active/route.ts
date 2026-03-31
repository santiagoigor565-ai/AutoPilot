import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiUser } from "@/lib/server/api-auth";
import { setActiveWorkspaceCookie } from "@/lib/server/current-workspace";

const bodySchema = z.object({
  workspaceId: z.string().min(1),
});

export async function PATCH(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  const membership = user.memberships.find((item) => item.workspaceId === parsed.data.workspaceId);
  if (!membership) {
    return NextResponse.json({ error: "Workspace fora do seu escopo." }, { status: 403 });
  }

  await setActiveWorkspaceCookie(parsed.data.workspaceId);
  return NextResponse.json({ ok: true });
}
