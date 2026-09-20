"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { taskSchema, type TaskInput } from "@/lib/validations/tasks";
import { createTask, updateTask } from "@/app/(dashboard)/taches/actions";

interface Team {
  id: string;
  name: string;
}

interface Assignee {
  id: string;
  full_name: string | null;
}

interface TaskFormDialogProps {
  mode: "create" | "edit";
  teams: Team[];
  staff: Assignee[];
  players: (Assignee & { full_name: string })[];
  task?: {
    id: string;
    title: string;
    description: string | null;
    team_id: string | null;
    due_date: string | null;
    assigned_profile_id: string | null;
    assigned_player_id: string | null;
  };
}

export function TaskFormDialog({ mode, teams, staff, players, task }: TaskFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const initialAssignee = task?.assigned_profile_id
    ? `profile:${task.assigned_profile_id}`
    : task?.assigned_player_id
      ? `player:${task.assigned_player_id}`
      : "none";

  const [assignee, setAssignee] = useState(initialAssignee);
  const [teamId, setTeamId] = useState(task?.team_id ?? "none");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      dueDate: task?.due_date ?? "",
    },
  });

  const onSubmit = (values: TaskInput) => {
    setServerError(null);
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("description", values.description ?? "");
    formData.set("dueDate", values.dueDate ?? "");
    formData.set("teamId", teamId === "none" ? "" : teamId);
    formData.set("assignee", assignee === "none" ? "" : assignee);

    startTransition(async () => {
      const result =
        mode === "edit" && task
          ? await updateTask(task.id, {}, formData)
          : await createTask({}, formData);

      if (result?.error) {
        setServerError(result.error);
        return;
      }
      setOpen(false);
      reset();
      setAssignee("none");
      setTeamId("none");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="h-4 w-4" />
            Nouvelle tâche
          </Button>
        ) : (
          <Button variant="ghost" size="icon" aria-label="Modifier la tâche">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nouvelle tâche" : "Modifier la tâche"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" placeholder="Apporter les maillots" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Détails..." {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Équipe (optionnel)</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Club entier</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Échéance</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assigné à</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Non assigné</SelectItem>
                {staff.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>Staff</SelectLabel>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={`profile:${s.id}`}>
                        {s.full_name ?? "Sans nom"}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {players.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>Joueurs</SelectLabel>
                    {players.map((p) => (
                      <SelectItem key={p.id} value={`player:${p.id}`}>
                        {p.full_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
