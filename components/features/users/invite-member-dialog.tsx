"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  inviteMemberSchema,
  assignableRoleValues,
  type InviteMemberInput,
} from "@/lib/validations/users";
import { inviteMember } from "@/app/(dashboard)/utilisateurs/actions";
import { ROLE_LABELS } from "@/lib/nav-items";

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", fullName: "", role: "coach" },
  });

  const role = watch("role");

  const onSubmit = (values: InviteMemberInput) => {
    setServerError(null);
    setSuccessEmail(null);
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("fullName", values.fullName ?? "");
    formData.set("role", values.role);

    startTransition(async () => {
      const result = await inviteMember({}, formData);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      setSuccessEmail(values.email);
      reset();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSuccessEmail(null);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          Inviter un membre
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un membre du staff</DialogTitle>
        </DialogHeader>

        {successEmail ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Invitation envoyée à <span className="font-medium">{successEmail}</span>. Le membre
              recevra un email pour définir son mot de passe et accéder au club.
            </p>
            <DialogFooter>
              <Button onClick={() => setSuccessEmail(null)}>Inviter quelqu&apos;un d&apos;autre</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="coach@club.fr" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet (optionnel)</Label>
              <Input id="fullName" {...register("fullName")} />
            </div>

            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={role} onValueChange={(v) => setValue("role", v as InviteMemberInput["role"])}>
                <SelectTrigger>
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
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Envoyer l&apos;invitation
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
