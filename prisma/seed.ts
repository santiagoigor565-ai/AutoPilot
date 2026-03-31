import { PrismaClient, MembershipRole, SubscriptionStatus, BillingProviderKind } from "@prisma/client";
import { createDefaultLandingContent } from "../src/types/builder";

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@landingflow.local" },
    update: { isSuperAdmin: true },
    create: {
      firebaseUid: "seed-admin-firebase-uid",
      email: "admin@landingflow.local",
      name: "Admin LandingFlow",
      isSuperAdmin: true,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "workspace-demo" },
    update: {},
    create: {
      name: "Workspace Demo",
      slug: "workspace-demo",
      ownerId: adminUser.id,
      memberships: {
        create: {
          userId: adminUser.id,
          role: MembershipRole.owner,
        },
      },
      subscriptions: {
        create: {
          provider: BillingProviderKind.mock,
          status: SubscriptionStatus.active,
          planCode: "pro",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
      },
      domains: {
        create: {
          host: "demo.localhost",
          type: "subdomain",
          status: "active",
          isPrimary: true,
        },
      },
    },
  });

  const content = createDefaultLandingContent();
  const page = await prisma.landingPage.upsert({
    where: { workspaceId_slug: { workspaceId: workspace.id, slug: "pagina-demo" } },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: "Pagina Demo",
      slug: slugify("pagina-demo"),
      siteSubdomain: "demo",
      seoTitle: "Landing de exemplo",
      seoDescription: "Landing page de exemplo para validar fluxo de publicacao.",
      draftContent: content,
      status: "draft",
    },
  });

  const existingVersions = await prisma.pageVersion.count({
    where: { landingPageId: page.id },
  });

  if (existingVersions === 0) {
    const version = await prisma.pageVersion.create({
      data: {
        workspaceId: workspace.id,
        landingPageId: page.id,
        version: 1,
        content,
        publishedById: adminUser.id,
      },
    });

    await prisma.landingPage.update({
      where: { id: page.id },
      data: {
        publishedVersionId: version.id,
        status: "published",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
