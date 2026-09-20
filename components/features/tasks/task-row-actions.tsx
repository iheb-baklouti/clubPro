"use client";

import { TaskFormDialog } from "@/components/features/tasks/task-form-dialog";
import { ConfirmDeleteButton } from "@/components/features/confirm-delete-button";
import { StatusToggle } from "@/components/features/matches/status-toggle";
import { deleteTask, setTaskStatus } from "@/app/(dashboard)/taches/actions";
import type { TaskStatusValue } from "@/lib/validations/tasks";

const STATUS_OPTIONS: { value: TaskStatusValue; label: string; activeClassName: string }[] = [
  { value: "a_faire", label: "À faire", activeClassName: "bg-amber-500 text-white" },
  { value: "fait", label: "Fait", activeClassName: "bg-primary text-primary-foreground" },
];

interface Team {
  id: string;
  name: string;
}

interface Assignee {
  id: string;
  full_name: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  team_id: string | null;
  due_date: string | null;
  assigned_profile_id: string | null;
  assigned_player_id: string | null;
  status: TaskStatusValue;
}

export function TaskStatusControl({ task }: { task: Task }) {
  return (
    <StatusToggle
      value={task.status}
      options={STATUS_OPTIONS}
      onSelect={(status) => setTaskStatus(task.id, status)}
    />
  );
}

export function TaskRowActions({
  task,
  teams,
  staff,
  players,
  canDelete,
}: {
  task: Task;
  teams: Team[];
  staff: Assignee[];
  players: (Assignee & { full_name: string })[];
  canDelete: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <TaskFormDialog mode="edit" teams={teams} staff={staff} players={players} task={task} />
      {canDelete && (
        <ConfirmDeleteButton label="Supprimer la tâche" onConfirm={() => deleteTask(task.id)} />
      )}
    </div>
  );
}
