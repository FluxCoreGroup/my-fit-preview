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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      feedback: {
        Row: {
          comments: string | null
          completed: boolean | null
          created_at: string
          had_pain: boolean | null
          id: string
          pain_zones: string[] | null
          rpe: number | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          comments?: string | null
          completed?: boolean | null
          created_at?: string
          had_pain?: boolean | null
          id?: string
          pain_zones?: string[] | null
          rpe?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          comments?: string | null
          completed?: boolean | null
          created_at?: string
          had_pain?: boolean | null
          id?: string
          pain_zones?: string[] | null
          rpe?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          activity_level: string | null
          age: number | null
          created_at: string
          equipment: string[] | null
          frequency: number | null
          goal_type: string
          has_breakfast: boolean | null
          health_conditions: string[] | null
          height: number | null
          horizon: string | null
          id: string
          location: string | null
          meals_per_day: number | null
          session_duration: number | null
          sex: string | null
          target_weight_loss: number | null
          user_id: string | null
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          equipment?: string[] | null
          frequency?: number | null
          goal_type: string
          has_breakfast?: boolean | null
          health_conditions?: string[] | null
          height?: number | null
          horizon?: string | null
          id?: string
          location?: string | null
          meals_per_day?: number | null
          session_duration?: number | null
          sex?: string | null
          target_weight_loss?: number | null
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          equipment?: string[] | null
          frequency?: number | null
          goal_type?: string
          has_breakfast?: boolean | null
          health_conditions?: string[] | null
          height?: number | null
          horizon?: string | null
          id?: string
          location?: string | null
          meals_per_day?: number | null
          session_duration?: number | null
          sex?: string | null
          target_weight_loss?: number | null
          user_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          completed: boolean | null
          created_at: string
          exercises: Json | null
          id: string
          session_date: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          exercises?: Json | null
          id?: string
          session_date?: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          exercises?: Json | null
          id?: string
          session_date?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          plan_type: string | null
          started_at: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          plan_type?: string | null
          started_at?: string | null
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          plan_type?: string | null
          started_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_preferences: {
        Row: {
          cardio_intensity: string | null
          created_at: string
          exercises_to_avoid: string | null
          experience_level: string
          favorite_exercises: string | null
          id: string
          limitations: string[] | null
          mobility_preference: string
          priority_zones: string[] | null
          progression_focus: string
          session_type: string
          split_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cardio_intensity?: string | null
          created_at?: string
          exercises_to_avoid?: string | null
          experience_level: string
          favorite_exercises?: string | null
          id?: string
          limitations?: string[] | null
          mobility_preference: string
          priority_zones?: string[] | null
          progression_focus: string
          session_type: string
          split_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cardio_intensity?: string | null
          created_at?: string
          exercises_to_avoid?: string | null
          experience_level?: string
          favorite_exercises?: string | null
          id?: string
          limitations?: string[] | null
          mobility_preference?: string
          priority_zones?: string[] | null
          progression_focus?: string
          session_type?: string
          split_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_checkins: {
        Row: {
          adherence_diet: number | null
          average_weight: number | null
          blockers: string | null
          created_at: string
          energy: string | null
          hunger: string | null
          id: string
          sessions_done: number | null
          sessions_planned: number | null
          sleep: string | null
          user_id: string | null
        }
        Insert: {
          adherence_diet?: number | null
          average_weight?: number | null
          blockers?: string | null
          created_at?: string
          energy?: string | null
          hunger?: string | null
          id?: string
          sessions_done?: number | null
          sessions_planned?: number | null
          sleep?: string | null
          user_id?: string | null
        }
        Update: {
          adherence_diet?: number | null
          average_weight?: number | null
          blockers?: string | null
          created_at?: string
          energy?: string | null
          hunger?: string | null
          id?: string
          sessions_done?: number | null
          sessions_planned?: number | null
          sleep?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
