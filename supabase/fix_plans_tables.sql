-- Исправление таблиц планов для работы с telegram_id
-- Выполните этот скрипт в SQL Editor Supabase

-- 1. Добавляем поле nutrition_preferences в таблицу users (если еще не добавлено)
ALTER TABLE users ADD COLUMN IF NOT EXISTS nutrition_preferences JSONB;

-- Комментарий к полю
COMMENT ON COLUMN users.nutrition_preferences IS 'Предпочтения пользователя по питанию (аллергии, предпочтения, ограничения)';

-- 2. Удаляем старые таблицы планов (если они есть)
DROP TABLE IF EXISTS user_workout_plans CASCADE;
DROP TABLE IF EXISTS user_nutrition_plans CASCADE;

-- 3. Создаем исправленную таблицу user_workout_plans
CREATE TABLE user_workout_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Создаем исправленную таблицу user_nutrition_plans
CREATE TABLE user_nutrition_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Создаем индексы для оптимизации
CREATE INDEX idx_user_workout_plans_user_id ON user_workout_plans(user_id);
CREATE INDEX idx_user_nutrition_plans_user_id ON user_nutrition_plans(user_id);
CREATE INDEX idx_user_workout_plans_active ON user_workout_plans(user_id, is_active);
CREATE INDEX idx_user_nutrition_plans_active ON user_nutrition_plans(user_id, is_active);

-- 6. Включаем Row Level Security
ALTER TABLE user_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_plans ENABLE ROW LEVEL SECURITY;

-- 7. Создаем RLS политики для telegram_id
DROP POLICY IF EXISTS "Users own workout plans" ON user_workout_plans;
CREATE POLICY "Users own workout plans" ON user_workout_plans
  FOR ALL USING (user_id = (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

DROP POLICY IF EXISTS "Users own nutrition plans" ON user_nutrition_plans;
CREATE POLICY "Users own nutrition plans" ON user_nutrition_plans
  FOR ALL USING (user_id = (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

-- 8. Создаем триггеры для автоматического обновления updated_at
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

-- 9. Проверяем результат
SELECT 'Plans tables fixed successfully!' as status;

-- 10. Показываем структуру созданных таблиц
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('user_workout_plans', 'user_nutrition_plans')
ORDER BY table_name, ordinal_position; 