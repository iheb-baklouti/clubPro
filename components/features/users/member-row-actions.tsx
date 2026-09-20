"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteButton } from "@/components/features/confirm-delete-button";
import { updateMemberRole, revokeMemberAccess } from "@/app/(dashboard)/utilisateurs/actions";
import { ROLE_LABELS } from "@/lib/nav-items";
import { staffRoleValues, type StaffRole } from "@/lib/validations/users";
import type { UserRole } from "@/lib/types";

function isStaffRole(role: UserRole): role is StaffRole {
  return (staffRoleValues as readonly string[]).includes(role);
}

export function MemberRoleSelect({
  profileId,
  role,
  isSelf,
}: {
  profileId: string;
  role: UserRole;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isSelf || !isStaffRole(role)) {
    return (
      <span className="text-sm text-muted-foreground">
        {ROLE_LABELS[role]}
        {isSelf ? " (vous)" : ""}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={role}
        onValueChange={(v) =>
          startTransition(async () => {
            const result = await updateMemberRole(profileId, v as StaffRole);
            if (result?.error) setError(result.error);
            else setError(null);
          })
        }
      >
        <SelectTrigger className="h-9 w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {staffRoleValues.map((value) => (
            <SelectItem key={value} value={value}>
              {ROLE_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function RevokeMemberButton({ profileId, isSelf }: { profileId: string; isSelf: boolean }) {
  if (isSelf) return null;

  return (
    <ConfirmDeleteButton
      label="Révoquer l'accès"
      onConfirm={() => revokeMemberAccess(profileId)}
    />
  );
}
