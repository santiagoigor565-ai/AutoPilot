import { db } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [users, workspaces, subscriptions, publishedPages] = await Promise.all([
    db.user.count(),
    db.workspace.count(),
    db.subscription.count(),
    db.landingPage.count({ where: { status: "published" } }),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Usuários</CardDescription>
          <CardTitle className="text-3xl">{users}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Workspaces</CardDescription>
          <CardTitle className="text-3xl">{workspaces}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Assinaturas</CardDescription>
          <CardTitle className="text-3xl">{subscriptions}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Páginas publicadas</CardDescription>
          <CardTitle className="text-3xl">{publishedPages}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

