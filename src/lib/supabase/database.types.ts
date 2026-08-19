export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Enums: {
      participant_type: "athlete" | "reference";
    };
    Tables: {
      participants: {
        Row: {
          id: string;
          name: string;
          birth_year: number | null;
          participant_type: Database["public"]["Enums"]["participant_type"];
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          birth_year?: number | null;
          participant_type?: Database["public"]["Enums"]["participant_type"];
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          birth_year?: number | null;
          participant_type?: Database["public"]["Enums"]["participant_type"];
          active?: boolean;
          created_at?: string;
        };
      };
      performance_tests: {
        Row: {
          id: string;
          participant_id: string;
          test_date: string;
          age_group: string | null;
          reach_height_cm: number | null;
          jump_reach_cm: number | null;
          sprint_93639_seconds: number | null;
          ball_control_count: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          test_date: string;
          age_group?: string | null;
          reach_height_cm?: number | null;
          jump_reach_cm?: number | null;
          sprint_93639_seconds?: number | null;
          ball_control_count?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          participant_id?: string;
          test_date?: string;
          age_group?: string | null;
          reach_height_cm?: number | null;
          jump_reach_cm?: number | null;
          sprint_93639_seconds?: number | null;
          ball_control_count?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
