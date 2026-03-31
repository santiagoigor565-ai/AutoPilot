import { MembershipRole } from "@prisma/client";
import { db } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function createWorkspaceForUser(params: { userId: string; name: string }) {
  const baseSlug = slugify(params.name);
  let slug = baseSlug;
  let attempt = 1;

  while (await db.workspace.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${attempt}`;
    attempt += 1;
  }

  const workspace = await db.workspace.create({
    data: {
      name: params.name,
      slug,
      ownerId: params.userId,
      memberships: {
        create: {
          userId: params.userId,
          role: MembershipRole.owner,
        },
      },
      domains: {
        create: {
          host: `${slug}.${process.env.ROOT_DOMAIN?.split(":")[0] ?? "localhost"}`,
          type: "subdomain",
          status: "active",
          isPrimary: true,
        },
      },
    },
  });

  return workspace;
}

export async function getDefaultWorkspaceIdForUser(userId: string) {
  const membership = await db.membership.findFirst({
    where: { userId },
    orderBy: {
      createdAt: "asc",
    },
  });

  return membership?.workspaceId ?? null;
}
