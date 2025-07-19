// User types
export interface User {
  id: string
  telegram_id: number
  username?: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Onboarding types
export interface OnboardingData {
  name: string
  age: number
  height: number // in cm
  current_weight: number // in kg
  target_weight: number // in kg
  goal_deadline: string // ISO date
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal_type: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'build_muscle'
  health_conditions?: string[]
  allergies?: string[]
}

// Nutrition types
export interface NutritionData {
  dish_name: string;
  total_nutrition: {
    calories: number;
    proteins: number;
    fats: number;
    carbs: number;
  };
  ingredients: Array<{
    name: string;
    weight_grams: number;
  }>;
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  weight: number;
}

export interface Meal {
  id?: number;
  user_id?: string;
  food_items: FoodItem[];
  created_at?: string;
}

export interface MealEntry {
  id: string
  user_id: string
  food_item_id: string
  food_item?: FoodItem
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  amount: number // in grams
  calories: number
  proteins: number
  fats: number
  carbs: number
  photo_url?: string
  notes?: string
  created_at: string
}

export interface DailyNutrition {
  date: string
  total_calories: number
  total_proteins: number
  total_fats: number
  total_carbs: number
  target_calories: number
  target_proteins: number
  target_fats: number
  target_carbs: number
  meals: MealEntry[]
}

// Water tracking types
export interface WaterEntry {
  id: string
  user_id: string
  amount: number // in ml
  created_at: string
}

export interface DailyWater {
  date: string
  total_amount: number
  target_amount: number
  entries: WaterEntry[]
}

// Weight tracking types
export interface WeightEntry {
  id: string
  user_id: string
  weight: number // in kg
  body_fat_percentage?: number
  muscle_mass?: number
  notes?: string
  created_at: string
}

// Health analysis types
export interface HealthAnalysis {
  id: string
  user_id: string
  analysis_type: 'blood' | 'urine' | 'hormones' | 'general'
  file_url?: string
  file_type: 'pdf' | 'image' | 'text'
  raw_data?: string
  ai_analysis: string
  recommendations: string[]
  key_findings: string[]
  created_at: string
}

// AI Chat types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Dashboard types
export interface DashboardData {
  user: User
  today_nutrition: DailyNutrition
  today_water: DailyWater
  latest_weight?: WeightEntry
  weekly_progress: {
    nutrition: DailyNutrition[]
    water: DailyWater[]
    weight: WeightEntry[]
  }
  monthly_progress: {
    nutrition: DailyNutrition[]
    water: DailyWater[]
    weight: WeightEntry[]
  }
  recent_messages: ChatMessage[]
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Component props types
export interface MetricCardProps {
  title: string
  value: number
  target?: number
  unit: string
  color: 'nutrition' | 'hydration' | 'heart' | 'weight' | 'sleep' | 'analysis'
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

export interface ProgressChartProps {
  data: Array<{
    date: string
    value: number
    target?: number
  }>
  color: string
  title: string
  unit: string
}

// Form types
export interface OnboardingFormData extends OnboardingData {}

export interface AddMealFormData {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_name: string
  amount: number
  photo?: File
}

export interface AddWaterFormData {
  amount: number
  time?: string
}

export interface AddWeightFormData {
  weight: number
  body_fat_percentage?: number
  muscle_mass?: number
  notes?: string
}

// OpenAI types
export interface OpenAIFoodAnalysis {
  detected_food: string
  confidence: number
  estimated_calories: number
  estimated_nutrition: {
    proteins: number
    fats: number
    carbs: number
  }
  ingredients: Array<{
    name: string
    weight_grams: number
  }>
  serving_suggestions?: string[]
  health_notes?: string[]
}

export interface OpenAIHealthAnalysis {
  analysis_type: string
  key_findings: string[]
  recommendations: string[]
  risk_factors?: string[]
  follow_up_suggestions?: string[]
  overall_assessment: string
}

// Telegram types
export interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

// --- Plan Generation Types ---

export interface MealDetail {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

export interface DailyNutritionPlan {
  day_of_week: number; // 1-7
  meals: MealDetail[];
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string; // e.g., "8-12" or "15"
  rest_seconds: number;
}

export interface DailyWorkoutPlan {
  day_of_week: number; // 1-7
  description: string; // e.g., "Leg Day", "Cardio"
  exercises: WorkoutExercise[];
}

export interface GeneratedPlan {
  nutrition_plan: DailyNutritionPlan[];
  workout_plan: DailyWorkoutPlan[];
}

export interface PlanGenerationParams {
  goal: 'lose_weight' | 'gain_mass' | 'maintain';
  experience: 'beginner' | 'intermediate' | 'advanced';
  workout_days: number[]; // [1, 3, 5] for Mon, Wed, Fri
  food_preferences: string; // "no fish, more chicken"
  user_info: {
    age: number;
    sex: 'male' | 'female';
    height: number;
    weight: number;
  };
} 