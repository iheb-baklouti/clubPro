import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  UserCog,
  ClipboardList,
  MessageSquare,
  Wallet,
  Dumbbell,
  LayoutTemplate,
  HeartPulse,
} from "lucide-react";

import type { UserRole } from "@/lib/types/database.types";

export interface NavItem {
  label: string;
  /** Absent tant que l'écran n'est pas encore construit (roadmap étapes 2-4). */
  href?: string;
  icon: LucideIcon;
}

export function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case "direction":
    case "admin":
      return [
        { label: "Tableau de bord", href: "/direction", icon: LayoutDashboard },
        { label: "Effectif", icon: Users },
        { label: "Calendrier", icon: CalendarDays },
        { label: "Utilisateurs & rôles", icon: UserCog },
        { label: "Tâches", icon: ClipboardList },
        { label: "Messagerie", icon: MessageSquare },
        { label: "Cotisations", icon: Wallet },
      ];
    case "staff_medical":
      return [
        { label: "Tableau de bord", href: "/coach", icon: LayoutDashboard },
        { label: "Suivi des blessures", icon: HeartPulse },
      ];
    case "coach":
    default:
      return [
        { label: "Tableau de bord", href: "/coach", icon: LayoutDashboard },
        { label: "Calendrier des matchs", icon: CalendarDays },
        { label: "Effectif", icon: Users },
        { label: "Entraînements", icon: Dumbbell },
        { label: "Éditeur tactique", icon: LayoutTemplate },
      ];
  }
}

export const ROLE_LABELS: Record<UserRole, string> = {
  direction: "Direction",
  coach: "Coach",
  staff_medical: "Staff médical",
  admin: "Administrateur",
};
