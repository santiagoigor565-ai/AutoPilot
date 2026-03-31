import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getApiUser } from "@/lib/server/api-auth";
import { assertWorkspaceAccess } from "@/lib/server/services/page-service";
import { getUploadUrl } from "@/lib/storage/s3";
import { db } from "@/lib/prisma";

const bodySchema = z.object({
  workspaceId: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
});

function sanitizeFilename(filename: string) {
  return filename.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  await assertWorkspaceAccess(user.id, parsed.data.workspaceId, "editor");

  try {
    const key = `${parsed.data.workspaceId}/${Date.now()}-${sanitizeFilename(parsed.data.filename)}`;
    const { signedUrl, publicUrl } = await getUploadUrl(key, parsed.data.mimeType);
    if (!publicUrl) {
      return NextResponse.json({ error: "S3_PUBLIC_URL_BASE não configurado." }, { status: 400 });
    }

    const asset = await db.asset.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        uploadedById: user.id,
        bucket: env.S3_BUCKET ?? "bucket",
        key,
        url: publicUrl,
        mimeType: parsed.data.mimeType,
        size: parsed.data.size,
      },
    });

    return NextResponse.json({ uploadUrl: signedUrl, asset }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao gerar upload URL." }, { status: 400 });
  }
}

