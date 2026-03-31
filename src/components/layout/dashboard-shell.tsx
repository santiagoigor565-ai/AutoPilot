"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, CreditCard, FileText, LayoutDashboard, Mail, Settings, Shield, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";

type DashboardShellProps = {
  user: {
    memberships: Array<{
      workspaceId: string;
      role: string;
      workspace: { id: string; name: string; slug: string };
    }>;
  };
  activeWorkspaceId: string | null;
  children: React.ReactNode;
  isAdmin?: boolean;
};

const appNav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/pages", label: "Landing pages", icon: FileText },
  { href: "/app/leads", label: "Leads", icon: Mail },
  { href: "/app/subscription", label: "Assinatura", icon: CreditCard },
  { href: "/app/settings/workspace", label: "Workspace", icon: Settings },
  { href: "/app/settings/profile", label: "Perfil", icon: UserCircle2 },
];

const adminNav = [
  { href: "/admin", label: "Admin dashboard", icon: Shield },
  { href: "/admin/users", label: "Usuarios", icon: UserCircle2 },
  { href: "/admin/workspaces", label: "Workspaces", icon: Building2 },
  { href: "/admin/subscriptions", label: "Assinaturas", icon: CreditCard },
  { href: "/admin/pages", label: "Paginas", icon: FileText },
];

function isRouteActive(pathname: string, href: string) {
  if (href === "/app" || href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({ user, activeWorkspaceId, children, isAdmin }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = isAdmin ? adminNav : appNav;
  const activeWorkspace = user.memberships.find((membership) => membership.workspaceId === activeWorkspaceId)?.workspace;

  useEffect(() => {
    nav.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [nav, router]);

  return (
    <div className="min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="border-b border-border px-5 py-5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">AutoPilot.com Platform</p>
          <h1 className="mt-1 text-lg font-semibold text-foreground">{isAdmin ? "Área administrativa" : activeWorkspace?.name ?? "Workspace"}</h1>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {!isAdmin ? (
          <div className="space-y-3 border-t border-border p-3">
            <WorkspaceSwitcher
              activeWorkspaceId={activeWorkspaceId}
              items={user.memberships.map((membership) => ({
                workspaceId: membership.workspaceId,
                workspace: membership.workspace,
              }))}
            />
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{activeWorkspace?.name ?? "Nenhum workspace"}</p>
              <p>{activeWorkspace?.slug ?? "Sem slug configurado"}</p>
            </div>
          </div>
        ) : null}
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1700px] items-center justify-end px-6 py-4">
            <form action="/api/auth/logout" method="post">
              <Button type="submit" variant="outline" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1700px] px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

