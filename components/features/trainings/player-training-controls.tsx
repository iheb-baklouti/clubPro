"use client";

import { StatusToggle } from "@/components/features/matches/status-toggle";
import { setTrainingAvailability, setAttendance } from "@/app/(dashboard)/entrainements/actions";
import type { AvailabilityStatusValue } from "@/lib/validations/matches";

const AVAILABILITY_OPTIONS: {
  value: AvailabilityStatusValue;
  label: string;
  activeClassName: string;
}[] = [
  { value: "present", label: "Présent", activeClassName: "bg-primary text-primary-foreground" },
  { value: "incertain", label: "Incertain", activeClassName: "bg-amber-500 text-white" },
  { value: "absent", label: "Absent", activeClassName: "bg-destructive text-destructive-foreground" },
];

const ATTENDANCE_OPTIONS: { value: "true" | "false"; label: string; activeClassName: string }[] = [
  { value: "true", label: "Présent", activeClassName: "bg-primary text-primary-foreground" },
  { value: "false", label: "Absent", activeClassName: "bg-destructive text-destructive-foreground" },
];

export function TrainingAvailabilityToggle({
  trainingId,
  playerId,
  value,
}: {
  trainingId: string;
  playerId: string;
  value: AvailabilityStatusValue | null;
}) {
  return (
    <StatusToggle
      value={value}
      options={AVAILABILITY_OPTIONS}
      onSelect={(status) => setTrainingAvailability(trainingId, playerId, status)}
    />
  );
}

export function AttendanceToggle({
  trainingId,
  playerId,
  value,
}: {
  trainingId: string;
  playerId: string;
  value: boolean | null;
}) {
  return (
    <StatusToggle
      value={value === null ? null : value ? "true" : "false"}
      options={ATTENDANCE_OPTIONS}
      onSelect={(v) => setAttendance(trainingId, playerId, v === "true")}
    />
  );
}
