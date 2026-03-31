import { db } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminSubscriptionsTable } from "@/components/layout/admin-subscriptions-table";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await db.subscription.findMany({
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 400,
  });

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>Assinaturas</CardTitle>
          <CardDescription>Ative, pause ou suspenda publicações por workspace.</CardDescription>
        </CardHeader>
      </Card>
      <AdminSubscriptionsTable
        items={subscriptions.map((item) => ({
          id: item.id,
          workspaceId: item.workspaceId,
          status: item.status,
          planCode: item.planCode,
          workspace: item.workspace,
        }))}
      />
    </div>
  );
}

