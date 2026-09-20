import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayerContext } from "@/lib/supabase/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateOnly } from "@/lib/format";

export default async function JoueurCotisationsPage() {
  const ctx = await getCurrentPlayerContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("id, label, amount, status, due_date, paid_at")
    .eq("player_id", ctx.playerId)
    .order("due_date", { ascending: true, nullsFirst: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes cotisations</h1>
        <p className="text-muted-foreground">Suivi de tes paiements au club.</p>
      </div>

      {!payments || payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <Wallet className="h-8 w-8" />
            <p>Aucune cotisation enregistrée pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{payment.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {Number(payment.amount).toFixed(2)}
                    {payment.due_date ? ` · Échéance ${formatDateOnly(payment.due_date)}` : ""}
                    {payment.paid_at ? ` · Payé le ${formatDateOnly(payment.paid_at)}` : ""}
                  </p>
                </div>
                <Badge variant={payment.status === "paye" ? "secondary" : "outline"}>
                  {payment.status === "paye" ? "Payé" : "En attente"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
