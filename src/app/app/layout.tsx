import { requireUser } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getActiveMembership } from "@/lib/server/current-workspace";

export default async function AppAreaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  const activeMembership = await getActiveMembership(user);
  const activeWorkspaceId = activeMembership?.workspaceId ?? null;

  return <DashboardShell user={user} activeWorkspaceId={activeWorkspaceId}>{children}</DashboardShell>;
}
