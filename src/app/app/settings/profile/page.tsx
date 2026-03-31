import { requireUser } from "@/lib/auth/guards";
import { isAuthOnlyModeEnabled } from "@/lib/auth-only-mode";
import { ProfileSettings } from "@/components/layout/profile-settings";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <ProfileSettings
      name={user.name}
      email={user.email}
      firebaseUid={user.firebaseUid}
      initialAvatarUrl={user.avatarUrl}
      isAuthOnlyMode={isAuthOnlyModeEnabled()}
    />
  );
}
