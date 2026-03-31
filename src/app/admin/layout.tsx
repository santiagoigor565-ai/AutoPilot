import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  if (!user.isSuperAdmin) {
    redirect("/app");
  }

  return (
    <DashboardShell user={user} activeWorkspaceId={null} isAdmin>
      {children}
    </DashboardShell>
  );
}
