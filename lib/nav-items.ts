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
  User,
  Settings,
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
        { label: "Paramètres du club", href: "/club", icon: Settings },
      ];
    case "staff_medical":
      return [
        { label: "Tableau de bord", href: "/coach", icon: LayoutDashboard },
        { label: "Suivi des blessures", icon: HeartPulse },
      ];
    case "joueur":
      return [
        { label: "Tableau de bord", href: "/joueur", icon: LayoutDashboard },
        { label: "Calendrier", href: "/joueur/calendrier", icon: CalendarDays },
        { label: "Mon profil", href: "/joueur/profil", icon: User },
        { label: "Tâches", href: "/joueur/taches", icon: ClipboardList },
        { label: "Cotisations", href: "/joueur/cotisations", icon: Wallet },
        { label: "Messagerie", href: "/joueur/messagerie", icon: MessageSquare },
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
  joueur: "Joueur",
};
