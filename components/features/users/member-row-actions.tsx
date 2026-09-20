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
import { assignableRoleValues, type AssignableRole } from "@/lib/validations/users";
import type { UserRole } from "@/lib/types";

function isAssignableRole(role: UserRole): role is AssignableRole {
  return (assignableRoleValues as readonly string[]).includes(role);
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

  if (isSelf || !isAssignableRole(role)) {
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
            const result = await updateMemberRole(profileId, v as AssignableRole);
            if (result?.error) setError(result.error);
            else setError(null);
          })
        }
      >
        <SelectTrigger className="h-9 w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {assignableRoleValues.map((value) => (
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
