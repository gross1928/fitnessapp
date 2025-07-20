export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string
          metadata: Json | null
          role: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type: string
          metadata?: Json | null
          role: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fitness_data: {
        Row: {
          body_temperature: number | null
          created_at: string
          heart_rate: number | null
          id: string
          recorded_at: string
          sleep_hours: number | null
          steps: number | null
          user_id: string
        }
        Insert: {
          body_temperature?: number | null
          created_at?: string
          heart_rate?: number | null
          id?: string
          recorded_at?: string
          sleep_hours?: number | null
          steps?: number | null
          user_id: string
        }
        Update: {
          body_temperature?: number | null
          created_at?: string
          heart_rate?: number | null
          id?: string
          recorded_at?: string
          sleep_hours?: number | null
          steps?: number | null
          user_id?: string
        }
        Relationships: []
      }
      food_analysis: {
        Row: {
          analysis_provider: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          image_url: string | null
          meal_entry_id: string | null
          raw_response: Json | null
          user_id: string | null
        }
        Insert: {
          analysis_provider?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          meal_entry_id?: string | null
          raw_response?: Json | null
          user_id?: string | null
        }
        Update: {
          analysis_provider?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          meal_entry_id?: string | null
          raw_response?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_analysis_meal_entry_id_fkey"
            columns: ["meal_entry_id"]
            isOneToOne: false
            referencedRelation: "meal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_analysis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      food_entries: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          fats: number | null
          food_name: string
          id: string
          photo_url: string | null
          protein: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fats?: number | null
          food_name: string
          id?: string
          photo_url?: string | null
          protein?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fats?: number | null
          food_name?: string
          id?: string
          photo_url?: string | null
          protein?: number | null
          user_id?: string
        }
        Relationships: []
      }
      food_items: {
        Row: {
          calories_per_100g: number
          carbs_per_100g: number
          created_at: string | null
          fats_per_100g: number
          id: string
          name: string
          proteins_per_100g: number
          user_id: string | null
        }
        Insert: {
          calories_per_100g: number
          carbs_per_100g: number
          created_at?: string | null
          fats_per_100g: number
          id?: string
          name: string
          proteins_per_100g: number
          user_id?: string | null
        }
        Update: {
          calories_per_100g?: number
          carbs_per_100g?: number
          created_at?: string | null
          fats_per_100g?: number
          id?: string
          name?: string
          proteins_per_100g?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      health_analyses: {
        Row: {
          ai_analysis: string
          analysis_type: string
          created_at: string | null
          file_type: string
          file_url: string | null
          id: string
          key_findings: string[]
          raw_data: string | null
          recommendations: string[]
          user_id: string | null
        }
        Insert: {
          ai_analysis: string
          analysis_type: string
          created_at?: string | null
          file_type: string
          file_url?: string | null
          id?: string
          key_findings: string[]
          raw_data?: string | null
          recommendations: string[]
          user_id?: string | null
        }
        Update: {
          ai_analysis?: string
          analysis_type?: string
          created_at?: string | null
          file_type?: string
          file_url?: string | null
          id?: string
          key_findings?: string[]
          raw_data?: string | null
          recommendations?: string[]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      health_reports: {
        Row: {
          analysis_result: string | null
          created_at: string
          file_url: string | null
          id: string
          recommendations: string | null
          report_type: string
          user_id: string
        }
        Insert: {
          analysis_result?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          recommendations?: string | null
          report_type: string
          user_id: string
        }
        Update: {
          analysis_result?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          recommendations?: string | null
          report_type?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_entries: {
        Row: {
          amount: number
          calories: number
          carbs: number
          created_at: string | null
          fats: number
          food_item_id: string | null
          food_name: string | null
          id: string
          meal_type: string
          notes: string | null
          photo_url: string | null
          proteins: number
          user_id: string | null
        }
        Insert: {
          amount: number
          calories: number
          carbs: number
          created_at?: string | null
          fats: number
          food_item_id?: string | null
          food_name?: string | null
          id?: string
          meal_type: string
          notes?: string | null
          photo_url?: string | null
          proteins: number
          user_id?: string | null
        }
        Update: {
          amount?: number
          calories?: number
          carbs?: number
          created_at?: string | null
          fats?: number
          food_item_id?: string | null
          food_name?: string | null
          id?: string
          meal_type?: string
          notes?: string | null
          photo_url?: string | null
          proteins?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_entries_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          age: number | null
          created_at: string
          current_weight: number | null
          height: number | null
          id: string
          name: string
          target_date: string | null
          target_weight: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          current_weight?: number | null
          height?: number | null
          id?: string
          name: string
          target_date?: string | null
          target_weight?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string
          current_weight?: number | null
          height?: number | null
          id?: string
          name?: string
          target_date?: string | null
          target_weight?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          activity_level: string | null
          age: number | null
          allergies: string[] | null
          avatar_url: string | null
          created_at: string | null
          current_weight: number | null
          daily_calorie_target: number | null
          daily_carb_target: number | null
          daily_fat_target: number | null
          daily_protein_target: number | null
          daily_water_target: number | null
          first_name: string | null
          gender: string | null
          goal_deadline: string | null
          goal_type: string | null
          health_conditions: string[] | null
          height: number | null
          id: string
          last_name: string | null
          name: string | null
          target_weight: number | null
          telegram_id: number
          updated_at: string | null
          username: string | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[] | null
          avatar_url?: string | null
          created_at?: string | null
          current_weight?: number | null
          daily_calorie_target?: number | null
          daily_carb_target?: number | null
          daily_fat_target?: number | null
          daily_protein_target?: number | null
          daily_water_target?: number | null
          first_name?: string | null
          gender?: string | null
          goal_deadline?: string | null
          goal_type?: string | null
          health_conditions?: string[] | null
          height?: number | null
          id?: string
          last_name?: string | null
          name?: string | null
          target_weight?: number | null
          telegram_id: number
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[] | null
          avatar_url?: string | null
          created_at?: string | null
          current_weight?: number | null
          daily_calorie_target?: number | null
          daily_carb_target?: number | null
          daily_fat_target?: number | null
          daily_protein_target?: number | null
          daily_water_target?: number | null
          first_name?: string | null
          gender?: string | null
          goal_deadline?: string | null
          goal_type?: string | null
          health_conditions?: string[] | null
          height?: number | null
          id?: string
          last_name?: string | null
          name?: string | null
          target_weight?: number | null
          telegram_id?: number
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      water_entries: {
        Row: {
          amount: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_entries: {
        Row: {
          body_fat_percentage: number | null
          created_at: string | null
          id: string
          muscle_mass: number | null
          notes: string | null
          user_id: string | null
          weight: number
        }
        Insert: {
          body_fat_percentage?: number | null
          created_at?: string | null
          id?: string
          muscle_mass?: number | null
          notes?: string | null
          user_id?: string | null
          weight: number
        }
        Update: {
          body_fat_percentage?: number | null
          created_at?: string | null
          id?: string
          muscle_mass?: number | null
          notes?: string | null
          user_id?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_nutrition_preferences: {
        Row: {
          id: string
          user_id: string
          allergies: string[]
          likes: string[]
          dislikes: string[]
          budget: string
          cooking_time: string
          meals_per_day: number
          dietary_restrictions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          allergies?: string[]
          likes?: string[]
          dislikes?: string[]
          budget?: string
          cooking_time?: string
          meals_per_day?: number
          dietary_restrictions?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          allergies?: string[]
          likes?: string[]
          dislikes?: string[]
          budget?: string
          cooking_time?: string
          meals_per_day?: number
          dietary_restrictions?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_nutrition_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_workout_preferences: {
        Row: {
          id: string
          user_id: string
          experience: string
          available_days: number[]
          session_duration: string
          equipment: string[]
          injuries: string[]
          fitness_level: number
          preferred_exercises: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          experience?: string
          available_days?: number[]
          session_duration?: string
          equipment?: string[]
          injuries?: string[]
          fitness_level?: number
          preferred_exercises?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          experience?: string
          available_days?: number[]
          session_duration?: string
          equipment?: string[]
          injuries?: string[]
          fitness_level?: number
          preferred_exercises?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_workout_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_nutrition: {
        Args: { user_uuid: string; target_date?: string }
        Returns: {
          total_calories: number
          total_proteins: number
          total_fats: number
          total_carbs: number
          meal_count: number
        }[]
      }
      get_daily_water: {
        Args: { user_uuid: string; target_date?: string }
        Returns: {
          total_water: number
          entry_count: number
        }[]
      }
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
