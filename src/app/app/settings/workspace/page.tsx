import { requireUser } from "@/lib/auth/guards";
import { WorkspaceSettings } from "@/components/layout/workspace-settings";

export default async function WorkspaceSettingsPage() {
  const user = await requireUser();
  return <WorkspaceSettings user={user} />;
}
