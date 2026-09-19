// Types générés manuellement pour correspondre aux migrations SQL de
// supabase/migrations. À régénérer avec `npm run db:types` une fois le
// projet Supabase lié (supabase link) — cette version restera valide tant
// que le schéma n'a pas changé.

export type UserRole = "direction" | "coach" | "staff_medical" | "admin";
export type PlayerStatus = "actif" | "blesse" | "suspendu";
export type MatchHomeAway = "domicile" | "exterieur";
export type MatchStatus = "a_venir" | "joue";
export type CallUpStatus = "convoque" | "absent" | "blesse";
export type EventType = "match" | "entrainement";
export type AvailabilityStatus = "present" | "absent" | "incertain";

export interface Database {
  public: {
    Tables: {
      clubs: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clubs"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          club_id: string | null;
          full_name: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          club_id?: string | null;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          club_id: string;
          name: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          name: string;
          category: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["teams"]["Insert"]>;
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          team_id: string;
          full_name: string;
          birth_date: string | null;
          position: string | null;
          jersey_number: number | null;
          photo_url: string | null;
          status: PlayerStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          full_name: string;
          birth_date?: string | null;
          position?: string | null;
          jersey_number?: number | null;
          photo_url?: string | null;
          status?: PlayerStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["players"]["Insert"]>;
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          team_id: string;
          opponent_name: string;
          match_date: string;
          location: string | null;
          competition_type: string | null;
          home_or_away: MatchHomeAway;
          score_home: number | null;
          score_away: number | null;
          status: MatchStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          opponent_name: string;
          match_date: string;
          location?: string | null;
          competition_type?: string | null;
          home_or_away?: MatchHomeAway;
          score_home?: number | null;
          score_away?: number | null;
          status?: MatchStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["matches"]["Insert"]>;
        Relationships: [];
      };
      match_call_ups: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          status: CallUpStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          status?: CallUpStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["match_call_ups"]["Insert"]>;
        Relationships: [];
      };
      availability_responses: {
        Row: {
          id: string;
          event_id: string;
          event_type: EventType;
          player_id: string;
          status: AvailabilityStatus;
          responded_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          event_type: EventType;
          player_id: string;
          status?: AvailabilityStatus;
          responded_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["availability_responses"]["Insert"]
        >;
        Relationships: [];
      };
      player_stats: {
        Row: {
          id: string;
          player_id: string;
          match_id: string;
          goals: number;
          assists: number;
          yellow_cards: number;
          red_cards: number;
          minutes_played: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          match_id: string;
          goals?: number;
          assists?: number;
          yellow_cards?: number;
          red_cards?: number;
          minutes_played?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["player_stats"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_club_id: { Args: Record<string, never>; Returns: string };
      current_role: { Args: Record<string, never>; Returns: UserRole };
      is_staff: { Args: Record<string, never>; Returns: boolean };
      is_manager: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      player_status: PlayerStatus;
      match_home_away: MatchHomeAway;
      match_status: MatchStatus;
      call_up_status: CallUpStatus;
      event_type: EventType;
      availability_status: AvailabilityStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
