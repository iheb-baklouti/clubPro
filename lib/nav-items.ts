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
  Repeat,
} from "lucide-react";

import type { UserRole } from "@/lib/types";

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
        { label: "Effectif", href: "/equipes", icon: Users },
        { label: "Calendrier", href: "/calendrier", icon: CalendarDays },
        { label: "Utilisateurs & rôles", href: "/utilisateurs", icon: UserCog },
        { label: "Tâches", href: "/taches", icon: ClipboardList },
        { label: "Messagerie", href: "/messagerie", icon: MessageSquare },
        { label: "Cotisations", href: "/cotisations", icon: Wallet },
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
        { label: "Calendrier des matchs", href: "/calendrier", icon: CalendarDays },
        { label: "Effectif", href: "/equipes", icon: Users },
        { label: "Entraînements", href: "/entrainements", icon: Dumbbell },
        { label: "Exercices", href: "/drills", icon: LayoutTemplate },
        { label: "Simulations", href: "/simulations", icon: Repeat },
        { label: "Tâches", href: "/taches", icon: ClipboardList },
        { label: "Messagerie", href: "/messagerie", icon: MessageSquare },
      ];
  }
}

export const ROLE_LABELS: Record<UserRole, string> = {
  direction: "Direction",
  coach: "Coach",
  staff_medical: "Staff médical",
  admin: "Administrateur",
};
