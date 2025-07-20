-- Таблица предпочтений питания пользователей
CREATE TABLE IF NOT EXISTS user_nutrition_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  allergies TEXT[] DEFAULT '{}',
  likes TEXT[] DEFAULT '{}',
  dislikes TEXT[] DEFAULT '{}',
  budget TEXT DEFAULT 'medium' CHECK (budget IN ('low', 'medium', 'high')),
  cooking_time TEXT DEFAULT 'medium' CHECK (cooking_time IN ('quick', 'medium', 'elaborate')),
  meals_per_day INTEGER DEFAULT 3 CHECK (meals_per_day >= 1 AND meals_per_day <= 6),
  dietary_restrictions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Таблица предпочтений тренировок пользователей
CREATE TABLE IF NOT EXISTS user_workout_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  experience TEXT DEFAULT 'beginner' CHECK (experience IN ('beginner', 'intermediate', 'advanced')),
  available_days INTEGER[] DEFAULT '{}',
  session_duration TEXT DEFAULT 'medium' CHECK (session_duration IN ('short', 'medium', 'long')),
  equipment TEXT[] DEFAULT '{}',
  injuries TEXT[] DEFAULT '{}',
  fitness_level INTEGER DEFAULT 5 CHECK (fitness_level >= 1 AND fitness_level <= 10),
  preferred_exercises TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_user_nutrition_preferences_user_id ON user_nutrition_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_preferences_user_id ON user_workout_preferences(user_id);

-- RLS политики для user_nutrition_preferences
ALTER TABLE user_nutrition_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own nutrition preferences" ON user_nutrition_preferences
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE telegram_id = (SELECT current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
    )
  );

CREATE POLICY "Users can insert their own nutrition preferences" ON user_nutrition_preferences
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE telegram_id = (SELECT current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
    )
  );

CREATE POLICY "Users can update their own nutrition preferences" ON user_nutrition_preferences
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE telegram_id = (SELECT current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
    )
  );

-- RLS политики для user_workout_preferences
ALTER TABLE user_workout_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workout preferences" ON user_workout_preferences
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE telegram_id = (SELECT current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
    )
  );

CREATE POLICY "Users can insert their own workout preferences" ON user_workout_preferences
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE telegram_id = (SELECT current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
    )
  );

CREATE POLICY "Users can update their own workout preferences" ON user_workout_preferences
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE telegram_id = (SELECT current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
    )
  ); 