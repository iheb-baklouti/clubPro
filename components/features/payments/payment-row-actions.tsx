"use client";

import { StatusToggle } from "@/components/features/matches/status-toggle";
import { ConfirmDeleteButton } from "@/components/features/confirm-delete-button";
import { deletePayment, setPaymentStatus } from "@/app/(dashboard)/cotisations/actions";
import type { PaymentStatusValue } from "@/lib/validations/payments";

const STATUS_OPTIONS: { value: PaymentStatusValue; label: string; activeClassName: string }[] = [
  { value: "en_attente", label: "En attente", activeClassName: "bg-amber-500 text-white" },
  { value: "paye", label: "Payé", activeClassName: "bg-primary text-primary-foreground" },
];

export function PaymentRowActions({
  paymentId,
  status,
}: {
  paymentId: string;
  status: PaymentStatusValue;
}) {
  return (
    <div className="flex items-center gap-2">
      <StatusToggle
        value={status}
        options={STATUS_OPTIONS}
        onSelect={(v) => setPaymentStatus(paymentId, v)}
      />
      <ConfirmDeleteButton
        label="Supprimer la cotisation"
        onConfirm={() => deletePayment(paymentId)}
      />
    </div>
  );
}
