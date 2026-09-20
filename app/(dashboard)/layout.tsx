import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/features/layout/sidebar-nav";
import { MobileNav } from "@/components/features/layout/mobile-nav";
import { UserMenu } from "@/components/features/layout/user-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url, club_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.club_id) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-center">
        <p className="max-w-sm text-muted-foreground">
          Votre compte n&apos;est rattaché à aucun club pour le moment. Demandez à votre direction
          de vous inviter, ou contactez le support.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center border-b px-6 text-lg font-semibold">ClubPro</div>
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav role={profile.role} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="flex items-center gap-2">
            <MobileNav role={profile.role} />
            <span className="text-lg font-semibold md:hidden">ClubPro</span>
          </div>
          <UserMenu
            fullName={profile.full_name}
            role={profile.role}
            avatarUrl={profile.avatar_url}
          />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
