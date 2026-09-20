import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function CoachDashboardPage() {
  const supabase = await createClient();
  const [{ count: upcomingMatches }, { count: teamsCount }] = await Promise.all([
    supabase.from("matches").select("id", { count: "exact", head: true }).eq("status", "a_venir"),
    supabase.from("teams").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord — Coach</h1>
        <p className="text-muted-foreground">Votre équipe en un coup d&apos;œil.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/calendrier">
          <Card className="transition-colors hover:bg-accent/50">
            <CardHeader>
              <CardTitle>Prochains matchs</CardTitle>
              <CardDescription>À venir pour le club</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{upcomingMatches ?? 0}</CardContent>
          </Card>
        </Link>

        <Link href="/equipes">
          <Card className="transition-colors hover:bg-accent/50">
            <CardHeader>
              <CardTitle>Équipes</CardTitle>
              <CardDescription>Catégories que vous encadrez</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{teamsCount ?? 0}</CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
