"use client";

import { StatusToggle } from "@/components/features/matches/status-toggle";
import { setAvailability, setCallUpStatus } from "@/app/(dashboard)/calendrier/actions";
import type {
  AvailabilityStatusValue,
  CallUpStatusValue,
} from "@/lib/validations/matches";

const AVAILABILITY_OPTIONS: {
  value: AvailabilityStatusValue;
  label: string;
  activeClassName: string;
}[] = [
  { value: "present", label: "Présent", activeClassName: "bg-primary text-primary-foreground" },
  { value: "incertain", label: "Incertain", activeClassName: "bg-amber-500 text-white" },
  { value: "absent", label: "Absent", activeClassName: "bg-destructive text-destructive-foreground" },
];

const CALL_UP_OPTIONS: {
  value: CallUpStatusValue;
  label: string;
  activeClassName: string;
}[] = [
  { value: "convoque", label: "Convoqué", activeClassName: "bg-primary text-primary-foreground" },
  { value: "blesse", label: "Blessé", activeClassName: "bg-amber-500 text-white" },
  { value: "absent", label: "Absent", activeClassName: "bg-destructive text-destructive-foreground" },
];

export function AvailabilityToggle({
  matchId,
  playerId,
  value,
}: {
  matchId: string;
  playerId: string;
  value: AvailabilityStatusValue | null;
}) {
  return (
    <StatusToggle
      value={value}
      options={AVAILABILITY_OPTIONS}
      onSelect={(status) => setAvailability(matchId, playerId, status)}
    />
  );
}

export function CallUpToggle({
  matchId,
  playerId,
  value,
}: {
  matchId: string;
  playerId: string;
  value: CallUpStatusValue | null;
}) {
  return (
    <StatusToggle
      value={value}
      options={CALL_UP_OPTIONS}
      onSelect={(status) => setCallUpStatus(matchId, playerId, status)}
    />
  );
}
