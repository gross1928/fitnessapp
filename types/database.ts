export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          telegram_id: number
          username: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          name: string | null
          age: number | null
          height: number | null
          current_weight: number | null
          target_weight: number | null
          goal_deadline: string | null
          activity_level: string | null
          goal_type: string | null
          health_conditions: string[] | null
          allergies: string[] | null
          daily_calorie_target: number | null
          daily_protein_target: number | null
          daily_fat_target: number | null
          daily_carb_target: number | null
          daily_water_target: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          telegram_id: number
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          name?: string | null
          age?: number | null
          height?: number | null
          current_weight?: number | null
          target_weight?: number | null
          goal_deadline?: string | null
          activity_level?: string | null
          goal_type?: string | null
          health_conditions?: string[] | null
          allergies?: string[] | null
          daily_calorie_target?: number | null
          daily_protein_target?: number | null
          daily_fat_target?: number | null
          daily_carb_target?: number | null
          daily_water_target?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          telegram_id?: number
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          name?: string | null
          age?: number | null
          height?: number | null
          current_weight?: number | null
          target_weight?: number | null
          goal_deadline?: string | null
          activity_level?: string | null
          goal_type?: string | null
          health_conditions?: string[] | null
          allergies?: string[] | null
          daily_calorie_target?: number | null
          daily_protein_target?: number | null
          daily_fat_target?: number | null
          daily_carb_target?: number | null
          daily_water_target?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      food_items: {
        Row: {
          id: string
          user_id: string
          name: string
          calories_per_100g: number
          proteins_per_100g: number
          fats_per_100g: number
          carbs_per_100g: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          calories_per_100g: number
          proteins_per_100g: number
          fats_per_100g: number
          carbs_per_100g: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          calories_per_100g?: number
          proteins_per_100g?: number
          fats_per_100g?: number
          carbs_per_100g?: number
          created_at?: string
        }
      }
      meal_entries: {
        Row: {
          id: string
          user_id: string
          food_item_id: string
          meal_type: string
          amount: number
          calories: number
          proteins: number
          fats: number
          carbs: number
          photo_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_item_id: string
          meal_type: string
          amount: number
          calories: number
          proteins: number
          fats: number
          carbs: number
          photo_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          food_item_id?: string
          meal_type?: string
          amount?: number
          calories?: number
          proteins?: number
          fats?: number
          carbs?: number
          photo_url?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      water_entries: {
        Row: {
          id: string
          user_id: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          created_at?: string
        }
      }
      weight_entries: {
        Row: {
          id: string
          user_id: string
          weight: number
          body_fat_percentage: number | null
          muscle_mass: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight: number
          body_fat_percentage?: number | null
          muscle_mass?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weight?: number
          body_fat_percentage?: number | null
          muscle_mass?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      health_analyses: {
        Row: {
          id: string
          user_id: string
          analysis_type: string
          file_url: string | null
          file_type: string
          raw_data: string | null
          ai_analysis: string
          recommendations: string[]
          key_findings: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          analysis_type: string
          file_url?: string | null
          file_type: string
          raw_data?: string | null
          ai_analysis: string
          recommendations: string[]
          key_findings: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          analysis_type?: string
          file_url?: string | null
          file_type?: string
          raw_data?: string | null
          ai_analysis?: string
          recommendations?: string[]
          key_findings?: string[]
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          role: string
          content: string
          message_type: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          content: string
          message_type: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          content?: string
          message_type?: string
          metadata?: Json | null
          created_at?: string
        }
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