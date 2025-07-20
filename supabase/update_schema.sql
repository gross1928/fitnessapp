-- Обновление схемы базы данных для поддержки сохраненных планов
-- Выполните этот скрипт в SQL Editor Supabase

-- 1. Добавляем поле nutrition_preferences в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS nutrition_preferences JSONB;

-- Комментарий к полю
COMMENT ON COLUMN users.nutrition_preferences IS 'Предпочтения пользователя по питанию (аллергии, предпочтения, ограничения)';

-- 2. Создаем таблицу user_workout_plans
CREATE TABLE IF NOT EXISTS user_workout_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создаем таблицу user_nutrition_plans
CREATE TABLE IF NOT EXISTS user_nutrition_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_user_workout_plans_user_id ON user_workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_nutrition_plans_user_id ON user_nutrition_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_plans_active ON user_workout_plans(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_nutrition_plans_active ON user_nutrition_plans(user_id, is_active);

-- 5. Включаем Row Level Security
ALTER TABLE user_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_plans ENABLE ROW LEVEL SECURITY;

-- 6. Создаем RLS политики
DROP POLICY IF EXISTS "Users own workout plans" ON user_workout_plans;
CREATE POLICY "Users own workout plans" ON user_workout_plans
  FOR ALL USING (user_id = (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

DROP POLICY IF EXISTS "Users own nutrition plans" ON user_nutrition_plans;
CREATE POLICY "Users own nutrition plans" ON user_nutrition_plans
  FOR ALL USING (user_id = (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

-- 7. Создаем триггеры для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_user_workout_plans_updated_at ON user_workout_plans;
CREATE TRIGGER update_user_workout_plans_updated_at 
  BEFORE UPDATE ON user_workout_plans 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_nutrition_plans_updated_at ON user_nutrition_plans;
CREATE TRIGGER update_user_nutrition_plans_updated_at 
  BEFORE UPDATE ON user_nutrition_plans 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Проверяем результат
SELECT 'Schema updated successfully!' as status; 