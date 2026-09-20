export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      availability_responses: {
        Row: {
          event_id: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          player_id: string
          responded_at: string
          status: Database["public"]["Enums"]["availability_status"]
        }
        Insert: {
          event_id: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          player_id: string
          responded_at?: string
          status?: Database["public"]["Enums"]["availability_status"]
        }
        Update: {
          event_id?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          player_id?: string
          responded_at?: string
          status?: Database["public"]["Enums"]["availability_status"]
        }
        Relationships: [
          {
            foreignKeyName: "availability_responses_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      carpool_offers: {
        Row: {
          created_at: string
          departure_location: string | null
          driver_player_id: string
          id: string
          match_id: string
          notes: string | null
          seats_total: number
        }
        Insert: {
          created_at?: string
          departure_location?: string | null
          driver_player_id: string
          id?: string
          match_id: string
          notes?: string | null
          seats_total?: number
        }
        Update: {
          created_at?: string
          departure_location?: string | null
          driver_player_id?: string
          id?: string
          match_id?: string
          notes?: string | null
          seats_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "carpool_offers_driver_player_id_fkey"
            columns: ["driver_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carpool_offers_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      carpool_passengers: {
        Row: {
          created_at: string
          id: string
          offer_id: string
          player_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          offer_id: string
          player_id: string
        }
        Update: {
          created_at?: string
          id?: string
          offer_id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carpool_passengers_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "carpool_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carpool_passengers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      drills: {
        Row: {
          category: Database["public"]["Enums"]["drill_category"]
          club_id: string
          created_at: string
          created_by: string | null
          description: string | null
          diagram_json: Json | null
          diagram_url: string | null
          id: string
          title: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["drill_category"]
          club_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          diagram_json?: Json | null
          diagram_url?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["drill_category"]
          club_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          diagram_json?: Json | null
          diagram_url?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "drills_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drills_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      formation_templates: {
        Row: {
          club_id: string
          created_at: string
          created_by: string | null
          formation_type: string
          id: string
          name: string
          notes: string | null
          positions_json: Json
          team_id: string | null
          updated_at: string
        }
        Insert: {
          club_id: string
          created_at?: string
          created_by?: string | null
          formation_type: string
          id?: string
          name: string
          notes?: string | null
          positions_json?: Json
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          club_id?: string
          created_at?: string
          created_by?: string | null
          formation_type?: string
          id?: string
          name?: string
          notes?: string | null
          positions_json?: Json
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formation_templates_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formation_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formation_templates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      formations: {
        Row: {
          created_at: string
          formation_type: string
          id: string
          match_id: string
          positions_json: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          formation_type: string
          id?: string
          match_id: string
          positions_json?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          formation_type?: string
          id?: string
          match_id?: string
          positions_json?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_call_ups: {
        Row: {
          created_at: string
          id: string
          match_id: string
          player_id: string
          status: Database["public"]["Enums"]["call_up_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          player_id: string
          status?: Database["public"]["Enums"]["call_up_status"]
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          player_id?: string
          status?: Database["public"]["Enums"]["call_up_status"]
        }
        Relationships: [
          {
            foreignKeyName: "match_call_ups_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_call_ups_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_mvp_votes: {
        Row: {
          created_at: string
          id: string
          match_id: string
          voted_player_id: string
          voter_profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          voted_player_id: string
          voter_profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          voted_player_id?: string
          voter_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_mvp_votes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_mvp_votes_voted_player_id_fkey"
            columns: ["voted_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_mvp_votes_voter_profile_id_fkey"
            columns: ["voter_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          match_id: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          match_id: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          match_id?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_photos_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_scouting_notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          key_players: string | null
          match_id: string
          notes: string | null
          strengths: string | null
          updated_at: string
          weaknesses: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_players?: string | null
          match_id: string
          notes?: string | null
          strengths?: string | null
          updated_at?: string
          weaknesses?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_players?: string | null
          match_id?: string
          notes?: string | null
          strengths?: string | null
          updated_at?: string
          weaknesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_scouting_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_scouting_notes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_tactical_snapshots: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          label: string
          match_id: string
          order_index: number
          positions_json: Json
          timestamp_seconds: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          match_id: string
          order_index?: number
          positions_json?: Json
          timestamp_seconds?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          match_id?: string
          order_index?: number
          positions_json?: Json
          timestamp_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_tactical_snapshots_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_tactical_snapshots_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          competition_type: string | null
          created_at: string
          home_or_away: Database["public"]["Enums"]["match_home_away"]
          id: string
          location: string | null
          match_date: string
          opponent_name: string
          score_away: number | null
          score_home: number | null
          status: Database["public"]["Enums"]["match_status"]
          team_id: string
        }
        Insert: {
          competition_type?: string | null
          created_at?: string
          home_or_away?: Database["public"]["Enums"]["match_home_away"]
          id?: string
          location?: string | null
          match_date: string
          opponent_name: string
          score_away?: number | null
          score_home?: number | null
          status?: Database["public"]["Enums"]["match_status"]
          team_id: string
        }
        Update: {
          competition_type?: string | null
          created_at?: string
          home_or_away?: Database["public"]["Enums"]["match_home_away"]
          id?: string
          location?: string | null
          match_date?: string
          opponent_name?: string
          score_away?: number | null
          score_home?: number | null
          status?: Database["public"]["Enums"]["match_status"]
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          club_id: string
          content: string
          created_at: string
          id: string
          sender_id: string
          team_id: string | null
        }
        Insert: {
          club_id: string
          content: string
          created_at?: string
          id?: string
          sender_id: string
          team_id?: string | null
        }
        Update: {
          club_id?: string
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          club_id: string
          created_at: string
          due_date: string | null
          id: string
          label: string
          paid_at: string | null
          player_id: string
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          club_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          label: string
          paid_at?: string | null
          player_id: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          club_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          label?: string
          paid_at?: string | null
          player_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_stats: {
        Row: {
          assists: number
          created_at: string
          goals: number
          id: string
          match_id: string
          minutes_played: number
          player_id: string
          red_cards: number
          yellow_cards: number
        }
        Insert: {
          assists?: number
          created_at?: string
          goals?: number
          id?: string
          match_id: string
          minutes_played?: number
          player_id: string
          red_cards?: number
          yellow_cards?: number
        }
        Update: {
          assists?: number
          created_at?: string
          goals?: number
          id?: string
          match_id?: string
          minutes_played?: number
          player_id?: string
          red_cards?: number
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          birth_date: string | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          id: string
          jersey_number: number | null
          medical_notes: string | null
          photo_url: string | null
          position: string | null
          status: Database["public"]["Enums"]["player_status"]
          team_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          id?: string
          jersey_number?: number | null
          medical_notes?: string | null
          photo_url?: string | null
          position?: string | null
          status?: Database["public"]["Enums"]["player_status"]
          team_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          id?: string
          jersey_number?: number | null
          medical_notes?: string | null
          photo_url?: string | null
          position?: string | null
          status?: Database["public"]["Enums"]["player_status"]
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          club_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          player_id: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          club_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          player_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          club_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          player_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          club_id: string
          created_at: string
          id: string
          logo_url: string | null
          name: string
          order_index: number
          website_url: string | null
        }
        Insert: {
          club_id: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          order_index?: number
          website_url?: string | null
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          order_index?: number
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsors_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      tactical_sequences: {
        Row: {
          club_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          notes: string | null
          steps_json: Json
          team_id: string
          updated_at: string
        }
        Insert: {
          club_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          notes?: string | null
          steps_json?: Json
          team_id: string
          updated_at?: string
        }
        Update: {
          club_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          notes?: string | null
          steps_json?: Json
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tactical_sequences_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tactical_sequences_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tactical_sequences_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_player_id: string | null
          assigned_profile_id: string | null
          club_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["task_status"]
          team_id: string | null
          title: string
        }
        Insert: {
          assigned_player_id?: string | null
          assigned_profile_id?: string | null
          club_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          team_id?: string | null
          title: string
        }
        Update: {
          assigned_player_id?: string | null
          assigned_profile_id?: string | null
          club_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          team_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_player_id_fkey"
            columns: ["assigned_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_profile_id_fkey"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          category: string
          club_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category: string
          club_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          club_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_attendance: {
        Row: {
          created_at: string
          id: string
          player_id: string
          present: boolean
          training_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          present?: boolean
          training_id: string
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          present?: boolean
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_attendance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_attendance_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      training_exercises: {
        Row: {
          created_at: string
          drill_id: string
          duration_minutes: number
          id: string
          order_index: number
          training_id: string
        }
        Insert: {
          created_at?: string
          drill_id: string
          duration_minutes?: number
          id?: string
          order_index?: number
          training_id: string
        }
        Update: {
          created_at?: string
          drill_id?: string
          duration_minutes?: number
          id?: string
          order_index?: number
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_exercises_drill_id_fkey"
            columns: ["drill_id"]
            isOneToOne: false
            referencedRelation: "drills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_exercises_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          created_at: string
          date: string
          description: string | null
          id: string
          team_id: string
          type: Database["public"]["Enums"]["training_type"]
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          id?: string
          team_id: string
          type?: Database["public"]["Enums"]["training_type"]
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          team_id?: string
          type?: Database["public"]["Enums"]["training_type"]
        }
        Relationships: [
          {
            foreignKeyName: "trainings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      video_clips: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          match_id: string
          tag_type: Database["public"]["Enums"]["video_tag_type"]
          timestamp_seconds: number
          video_url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          match_id: string
          tag_type?: Database["public"]["Enums"]["video_tag_type"]
          timestamp_seconds?: number
          video_url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          match_id?: string
          tag_type?: Database["public"]["Enums"]["video_tag_type"]
          timestamp_seconds?: number
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_clips_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_clips_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_club_id: { Args: never; Returns: string }
      current_player_id: { Args: never; Returns: string }
      current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_coach_or_manager: { Args: never; Returns: boolean }
      is_manager: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      availability_status: "present" | "absent" | "incertain"
      call_up_status: "convoque" | "absent" | "blesse"
      drill_category: "physique" | "technique" | "tactique"
      event_type: "match" | "entrainement"
      match_home_away: "domicile" | "exterieur"
      match_status: "a_venir" | "joue"
      payment_status: "en_attente" | "paye"
      player_status: "actif" | "blesse" | "suspendu"
      task_status: "a_faire" | "fait"
      training_type: "physique" | "technique" | "tactique" | "recuperation"
      user_role: "direction" | "coach" | "staff_medical" | "admin" | "joueur"
      video_tag_type: "but" | "occasion" | "faute" | "carton"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      availability_status: ["present", "absent", "incertain"],
      call_up_status: ["convoque", "absent", "blesse"],
      drill_category: ["physique", "technique", "tactique"],
      event_type: ["match", "entrainement"],
      match_home_away: ["domicile", "exterieur"],
      match_status: ["a_venir", "joue"],
      payment_status: ["en_attente", "paye"],
      player_status: ["actif", "blesse", "suspendu"],
      task_status: ["a_faire", "fait"],
      training_type: ["physique", "technique", "tactique", "recuperation"],
      user_role: ["direction", "coach", "staff_medical", "admin", "joueur"],
      video_tag_type: ["but", "occasion", "faute", "carton"],
    },
  },
} as const
