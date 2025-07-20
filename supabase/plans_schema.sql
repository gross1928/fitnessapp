-- Таблица для сохранения планов тренировок
CREATE TABLE IF NOT EXISTS user_workout_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  name TEXT DEFAULT 'Мой план тренировок'
);

-- Таблица для сохранения планов питания
CREATE TABLE IF NOT EXISTS user_nutrition_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  name TEXT DEFAULT 'Мой план питания'
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_user_workout_plans_user_id ON user_workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_plans_created_at ON user_workout_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_nutrition_plans_user_id ON user_nutrition_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_nutrition_plans_created_at ON user_nutrition_plans(created_at DESC);

-- RLS политики для безопасности
ALTER TABLE user_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_plans ENABLE ROW LEVEL SECURITY;

-- Политики для планов тренировок
CREATE POLICY "Users can view their own workout plans" ON user_workout_plans
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own workout plans" ON user_workout_plans
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own workout plans" ON user_workout_plans
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own workout plans" ON user_workout_plans
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Политики для планов питания
CREATE POLICY "Users can view their own nutrition plans" ON user_nutrition_plans
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own nutrition plans" ON user_nutrition_plans
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own nutrition plans" ON user_nutrition_plans
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own nutrition plans" ON user_nutrition_plans
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_user_workout_plans_updated_at 
  BEFORE UPDATE ON user_workout_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_nutrition_plans_updated_at 
  BEFORE UPDATE ON user_nutrition_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 