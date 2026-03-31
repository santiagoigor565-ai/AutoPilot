import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getBillingProvider } from "@/lib/billing";

function isAuthorized(request: Request) {
  if (!env.ASAAS_WEBHOOK_TOKEN) return true;

  const tokenFromHeader = request.headers.get("asaas-access-token");
  return tokenFromHeader === env.ASAAS_WEBHOOK_TOKEN;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Token de webhook invalido." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as unknown;
  if (!payload) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  const provider = getBillingProvider();
  if (provider.providerName !== "asaas" || !provider.syncWebhook) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await provider.syncWebhook(payload);
  return NextResponse.json({ ok: true });
}
