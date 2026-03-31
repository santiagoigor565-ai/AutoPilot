import { db } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminWorkspacesPage() {
  const workspaces = await db.workspace.findMany({
    include: {
      owner: {
        select: {
          email: true,
          name: true,
        },
      },
      subscriptions: true,
      landingPages: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>Workspaces</CardTitle>
          <CardDescription>Controle dos tenants e saúde operacional.</CardDescription>
        </CardHeader>
      </Card>

      {workspaces.map((workspace) => (
        <Card key={workspace.id}>
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">{workspace.name}</p>
              <p className="text-sm text-muted-foreground">{workspace.slug}</p>
              <p className="text-xs text-muted-foreground">Owner: {workspace.owner.name ?? workspace.owner.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{workspace.landingPages.length} páginas</Badge>
              <Badge variant="secondary" className="capitalize">
                {workspace.subscriptions[0]?.status ?? "trial"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

