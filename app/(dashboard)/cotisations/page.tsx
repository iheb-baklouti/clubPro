import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentFormDialog } from "@/components/features/payments/payment-form-dialog";
import { PaymentRowActions } from "@/components/features/payments/payment-row-actions";
import { formatDateOnly } from "@/lib/format";

export default async function CotisationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isManager = currentProfile?.role === "direction" || currentProfile?.role === "admin";
  if (!isManager) redirect("/");

  const [{ data: payments }, { data: players }] = await Promise.all([
    supabase
      .from("payments")
      .select("*, players(full_name)")
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("players").select("id, full_name").order("full_name"),
  ]);

  const totalDue = (payments ?? [])
    .filter((p) => p.status === "en_attente")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cotisations</h1>
          <p className="text-muted-foreground">
            Suivi des paiements — {totalDue.toFixed(2)} en attente au total.
          </p>
        </div>
        <PaymentFormDialog players={players ?? []} />
      </div>

      {!payments || payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <Wallet className="h-8 w-8" />
            <p>Aucune cotisation enregistrée pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Joueur</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.players?.full_name}</TableCell>
                  <TableCell>{payment.label}</TableCell>
                  <TableCell>{Number(payment.amount).toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.due_date ? formatDateOnly(payment.due_date) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <PaymentRowActions paymentId={payment.id} status={payment.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
