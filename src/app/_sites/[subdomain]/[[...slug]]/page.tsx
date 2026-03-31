import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { parseLandingContent } from "@/types/builder";
import { LandingRenderer } from "@/components/landing/landing-renderer";
import { resolvePublishedPageByHost } from "@/lib/server/published-page";

async function getRequestHost() {
  const headerStore = await headers();
  return headerStore.get("x-forwarded-host") ?? headerStore.get("host");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await resolvePublishedPageByHost(await getRequestHost(), slug?.[0]);

  if (!page) {
    return {
      title: "Pagina nao encontrada",
      description: "A landing page publicada nao foi encontrada.",
    };
  }

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    openGraph: page.ogImageUrl
      ? {
          images: [page.ogImageUrl],
          title: page.seoTitle,
          description: page.seoDescription,
        }
      : undefined,
    icons: page.faviconUrl
      ? {
          icon: page.faviconUrl,
        }
      : undefined,
  };
}

export default async function PublishedTenantPage({
  params,
}: {
  params: Promise<{ subdomain: string; slug?: string[] }>;
}) {
  const { slug } = await params;
  const page = await resolvePublishedPageByHost(await getRequestHost(), slug?.[0]);
  if (!page?.publishedVersion) {
    notFound();
  }

  return <LandingRenderer content={parseLandingContent(page.publishedVersion.content)} pageId={page.id} />;
}
