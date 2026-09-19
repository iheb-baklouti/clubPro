import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function DirectionDashboardPage() {
  const supabase = await createClient();
  const { count: teamsCount } = await supabase
    .from("teams")
    .select("id", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord — Direction</h1>
        <p className="text-muted-foreground">Vue globale du club.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Équipes</CardTitle>
            <CardDescription>Catégories actives dans le club</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{teamsCount ?? 0}</CardContent>
        </Card>
      </div>
    </div>
  );
}
