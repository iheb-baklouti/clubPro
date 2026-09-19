import type { UserRole } from "@/lib/types/database.types";

export type { UserRole };

export interface Profile {
  id: string;
  clubId: string | null;
  fullName: string | null;
  role: UserRole;
  avatarUrl: string | null;
}

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof import("lucide-react");
}
