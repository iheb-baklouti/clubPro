import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClubLogoUploader } from "@/components/features/club/club-logo-uploader";
import { ClubNameForm } from "@/components/features/club/club-name-form";
import { SponsorsManager } from "@/components/features/club/sponsors-manager";

export default async function ClubSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, club_id").eq("id", user.id).single();
  const isManager = profile?.role === "direction" || profile?.role === "admin";
  if (!isManager || !profile?.club_id) redirect("/");

  const { data: club } = await supabase.from("clubs").select("id, name, logo_url").eq("id", profile.club_id).single();
  if (!club) redirect("/");

  const { data: sponsors } = await supabase
    .from("sponsors")
    .select("id, name, logo_url, website_url")
    .eq("club_id", club.id)
    .order("order_index");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres du club</h1>
        <p className="text-muted-foreground">Identité visuelle affichée dans toute l&apos;application.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <ClubLogoUploader clubId={club.id} currentLogoUrl={club.logo_url} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nom du club</CardTitle>
        </CardHeader>
        <CardContent>
          <ClubNameForm currentName={club.name} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sponsors</CardTitle>
        </CardHeader>
        <CardContent>
          <SponsorsManager clubId={club.id} sponsors={sponsors ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
