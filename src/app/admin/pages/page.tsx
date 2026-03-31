import { db } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminPagesTable } from "@/components/layout/admin-pages-table";

export default async function AdminPagesPage() {
  const pages = await db.landingPage.findMany({
    include: {
      workspace: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>Páginas</CardTitle>
          <CardDescription>Monitore páginas publicadas e suspenda quando necessário.</CardDescription>
        </CardHeader>
      </Card>
      <AdminPagesTable
        items={pages.map((page) => ({
          id: page.id,
          name: page.name,
          slug: page.slug,
          status: page.status,
          workspace: page.workspace,
        }))}
      />
    </div>
  );
}

