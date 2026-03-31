import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

const hasS3Config = Boolean(
  env.S3_ENDPOINT && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY && env.S3_BUCKET,
);

function getClient() {
  if (!hasS3Config) {
    throw new Error("S3/R2 não configurado.");
  }

  return new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID!,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: false,
  });
}

export async function getUploadUrl(key: string, contentType: string) {
  const client = getClient();
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(client, command, { expiresIn: 60 * 5 });
  const publicUrl = env.S3_PUBLIC_URL_BASE ? `${env.S3_PUBLIC_URL_BASE.replace(/\/+$/, "")}/${key}` : null;
  return { signedUrl, publicUrl };
}

