import { db } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    include: {
      memberships: {
        include: {
          workspace: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>Visão administrativa de contas autenticadas.</CardDescription>
        </CardHeader>
      </Card>
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">{user.name ?? user.email}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.isSuperAdmin ? <Badge>super admin</Badge> : null}
              {user.memberships.map((membership) => (
                <Badge key={`${user.id}-${membership.workspaceId}`} variant="outline">
                  {membership.workspace.name} ({membership.role})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

