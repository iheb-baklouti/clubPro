import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function CoachDashboardPage() {
  const supabase = await createClient();
  const { count: upcomingMatches } = await supabase
    .from("matches")
    .select("id", { count: "exact", head: true })
    .eq("status", "a_venir");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord — Coach</h1>
        <p className="text-muted-foreground">Votre équipe en un coup d&apos;œil.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Prochains matchs</CardTitle>
            <CardDescription>À venir pour votre équipe</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{upcomingMatches ?? 0}</CardContent>
        </Card>
      </div>
    </div>
  );
}
