-- ДаЕда Health Coach Database Schema
-- Создание таблиц для персонального AI-коуча по здоровью

-- Включение расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    
    -- Личные данные
    name TEXT,
    age INTEGER,
    height INTEGER, -- в см
    gender TEXT CHECK (gender IN ('male', 'female')),
    current_weight DECIMAL(5,2), -- в кг
    target_weight DECIMAL(5,2), -- в кг
    goal_deadline DATE,
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    goal_type TEXT CHECK (goal_type IN ('lose', 'gain', 'maintain')),
    
    -- Дополнительные данные
    health_conditions TEXT[],
    allergies TEXT[],
    
    -- Цели по питанию (рассчитываются AI)
    daily_calorie_target INTEGER,
    daily_protein_target INTEGER, -- в граммах
    daily_fat_target INTEGER, -- в граммах
    daily_carb_target INTEGER, -- в граммах
    daily_water_target INTEGER, -- в мл
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица продуктов питания
CREATE TABLE IF NOT EXISTS food_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calories_per_100g INTEGER NOT NULL,
    proteins_per_100g DECIMAL(5,2) NOT NULL,
    fats_per_100g DECIMAL(5,2) NOT NULL,
    carbs_per_100g DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица приемов пищи
CREATE TABLE IF NOT EXISTS meal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES food_items(id) ON DELETE CASCADE,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
    amount INTEGER NOT NULL, -- в граммах
    calories INTEGER NOT NULL,
    proteins DECIMAL(5,2) NOT NULL,
    fats DECIMAL(5,2) NOT NULL,
    carbs DECIMAL(5,2) NOT NULL,
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица потребления воды
CREATE TABLE IF NOT EXISTS water_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- в мл
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица записей веса
CREATE TABLE IF NOT EXISTS weight_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL, -- в кг
    body_fat_percentage DECIMAL(4,1), -- в процентах
    muscle_mass DECIMAL(5,2), -- в кг
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица анализов здоровья
CREATE TABLE IF NOT EXISTS health_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    analysis_type TEXT CHECK (analysis_type IN ('blood', 'urine', 'hormones', 'general')) NOT NULL,
    file_url TEXT,
    file_type TEXT CHECK (file_type IN ('pdf', 'image', 'text')) NOT NULL,
    raw_data TEXT, -- для текстовых данных
    ai_analysis TEXT NOT NULL,
    recommendations TEXT[] NOT NULL,
    key_findings TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица сообщений чата с AI
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'food_photo', 'analysis_file', 'water_log')) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_meal_entries_user_id_created ON meal_entries(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_water_entries_user_id_created ON water_entries(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_id_created ON weight_entries(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_health_analyses_user_id ON health_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id_created ON chat_messages(user_id, created_at);

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at в таблице users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) политики
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Политики для users (упрощенные для начала)
DROP POLICY IF EXISTS "Enable all for users" ON users;
CREATE POLICY "Enable all for users" ON users FOR ALL USING (true);

-- Политики для остальных таблиц (доступ только к своим данным)
DROP POLICY IF EXISTS "Users own food_items" ON food_items;
CREATE POLICY "Users own food_items" ON food_items
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

DROP POLICY IF EXISTS "Users own meal_entries" ON meal_entries;
CREATE POLICY "Users own meal_entries" ON meal_entries
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

DROP POLICY IF EXISTS "Users own water_entries" ON water_entries;
CREATE POLICY "Users own water_entries" ON water_entries
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

DROP POLICY IF EXISTS "Users own weight_entries" ON weight_entries;
CREATE POLICY "Users own weight_entries" ON weight_entries
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

DROP POLICY IF EXISTS "Users own health_analyses" ON health_analyses;
CREATE POLICY "Users own health_analyses" ON health_analyses
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

DROP POLICY IF EXISTS "Users own chat_messages" ON chat_messages;
CREATE POLICY "Users own chat_messages" ON chat_messages
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

-- Функции для получения статистики
DROP FUNCTION IF EXISTS get_daily_nutrition(UUID, DATE);
CREATE OR REPLACE FUNCTION get_daily_nutrition(user_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    total_calories BIGINT,
    total_proteins NUMERIC,
    total_fats NUMERIC,
    total_carbs NUMERIC,
    meal_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(calories), 0) as total_calories,
        COALESCE(SUM(proteins), 0) as total_proteins,
        COALESCE(SUM(fats), 0) as total_fats,
        COALESCE(SUM(carbs), 0) as total_carbs,
        COUNT(*) as meal_count
    FROM meal_entries 
    WHERE user_id = user_uuid 
    AND DATE(created_at) = target_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS get_daily_water(UUID, DATE);
CREATE OR REPLACE FUNCTION get_daily_water(user_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    total_water BIGINT,
    entry_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(amount), 0) as total_water,
        COUNT(*) as entry_count
    FROM water_entries 
    WHERE user_id = user_uuid 
    AND DATE(created_at) = target_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Комментарии к таблицам
COMMENT ON TABLE users IS 'Таблица пользователей с их персональными данными и целями';
COMMENT ON TABLE food_items IS 'База данных продуктов питания с пищевой ценностью';
COMMENT ON TABLE meal_entries IS 'Записи о приемах пищи пользователей';
COMMENT ON TABLE water_entries IS 'Записи о потреблении воды';
COMMENT ON TABLE weight_entries IS 'Записи измерений веса и состава тела';
COMMENT ON TABLE health_analyses IS 'Анализы здоровья, загруженные пользователями';
COMMENT ON TABLE chat_messages IS 'История сообщений с AI-коучем'; 
-- Исправление политик RLS для регистрации пользователей в ДаЕда
-- Выполните этот SQL в вашей Supabase базе данных

-- 1. Удаляем старые политики для users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- 2. Создаем новые политики с поддержкой service role
-- Политика для чтения: пользователи видят только свой профиль ИЛИ service role видит всё
CREATE POLICY "Users can view own profile or service role access" ON users
    FOR SELECT USING (
        telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint
        OR 
        current_setting('role') = 'service_role'
    );

-- Политика для обновления: пользователи обновляют только свой профиль ИЛИ service role обновляет всё
CREATE POLICY "Users can update own profile or service role access" ON users
    FOR UPDATE USING (
        telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint
        OR 
        current_setting('role') = 'service_role'
    );

-- Политика для создания: любой может создать профиль (для регистрации) ИЛИ service role
CREATE POLICY "Anyone can insert user profile or service role access" ON users
    FOR INSERT WITH CHECK (
        true  -- Разрешаем создание новых пользователей
    );

-- 3. Альтернативный подход: временно отключить RLS для users (если предыдущий не работает)
-- Раскомментируйте следующую строку если нужно полностью отключить RLS для users:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 4. Добавляем политику для удаления (service role only)
CREATE POLICY "Service role can delete users" ON users
    FOR DELETE USING (
        current_setting('role') = 'service_role'
    );

-- 5. Проверяем, что все политики созданы
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- 6. Показываем информацию о RLS статусе (исправлено - убрана несуществующая колонка)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users'; 
ALTER TABLE users DISABLE ROW LEVEL SECURITY;


-- Удалить старую таблицу (если есть данные, сделайте бэкап)
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Создать таблицу заново с правильной структурой
CREATE TABLE chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'food_photo', 'analysis_file', 'water_log')) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создать индекс
CREATE INDEX idx_chat_messages_user_id_created ON chat_messages(user_id, created_at);

-- Включить RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Создать политику
CREATE POLICY "Users own data" ON chat_messages
    FOR ALL USING (user_id = (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

-- Проверить структуру
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
ORDER BY ordinal_position;

-- Посмотреть все сообщения с ролями
SELECT id, role, LEFT(content, 50) as content_preview, created_at
FROM chat_messages 
ORDER BY created_at DESC;

-- Fix for food analysis functionality

-- 1. Add food_name column to meal_entries table
ALTER TABLE meal_entries
ADD COLUMN IF NOT EXISTS food_name TEXT;

-- 2. Create food_analysis table
CREATE TABLE IF NOT EXISTS food_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    meal_entry_id UUID REFERENCES meal_entries(id) ON DELETE CASCADE,
    image_url TEXT,
    analysis_provider TEXT DEFAULT 'openai',
    raw_response JSONB,
    confidence_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add RLS policy for the new table
ALTER TABLE food_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own data" ON food_analysis;
CREATE POLICY "Users own data" ON food_analysis
    FOR ALL USING (user_id = (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

-- 4. Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_food_analysis_user_id ON food_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_food_analysis_meal_entry_id ON food_analysis(meal_entry_id);

COMMENT ON TABLE food_analysis IS 'Результаты анализа фотографий еды через AI';


-- 1. Удаляем старое правило (политику) для таблицы food_items
DROP POLICY IF EXISTS "Users own data" ON public.food_items;

-- 2. Полностью отключаем проверку прав (RLS) для таблицы food_items
ALTER TABLE public.food_items DISABLE ROW LEVEL SECURITY;

-- Шаг 1: Удаляем дубликаты, оставляя только одну (самую старую) запись
DELETE FROM public.food_items a
USING public.food_items b
WHERE
    a.id < b.id
    AND a.user_id = b.user_id
    AND a.name = b.name;

-- Шаг 2: Теперь, когда дубликаты удалены, создаем уникальный индекс
CREATE UNIQUE INDEX IF NOT EXISTS food_items_user_id_name_key ON public.food_items (user_id, name);

-- Main plans table
CREATE TABLE public.plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL, -- 'nutrition', 'workout', or 'combined'
    goals text,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.plans FOR SELECT USING (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Enable insert for authenticated users" ON public.plans FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Enable update for authenticated users" ON public.plans FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable delete for authenticated users" ON public.plans FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);


-- Nutrition plans details
CREATE TABLE public.nutrition_plans (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE NOT NULL,
    day_of_week smallint NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
    meal_type text NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    description text,
    calories integer,
    protein real,
    fats real,
    carbs real,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for plan owners" ON public.nutrition_plans FOR SELECT USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = nutrition_plans.plan_id AND plans.user_id = auth.uid())));
CREATE POLICY "Enable insert for plan owners" ON public.nutrition_plans FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = nutrition_plans.plan_id AND plans.user_id = auth.uid())));
CREATE POLICY "Enable update for plan owners" ON public.nutrition_plans FOR UPDATE USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = nutrition_plans.plan_id AND plans.user_id = auth.uid())));
CREATE POLICY "Enable delete for plan owners" ON public.nutrition_plans FOR DELETE USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = nutrition_plans.plan_id AND plans.user_id = auth.uid())));


-- Workout plans details
CREATE TABLE public.workout_plans (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE NOT NULL,
    day_of_week smallint NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for plan owners" ON public.workout_plans FOR SELECT USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = workout_plans.plan_id AND plans.user_id = auth.uid())));
CREATE POLICY "Enable insert for plan owners" ON public.workout_plans FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = workout_plans.plan_id AND plans.user_id = auth.uid())));
CREATE POLICY "Enable update for plan owners" ON public.workout_plans FOR UPDATE USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = workout_plans.plan_id AND plans.user_id = auth.uid())));
CREATE POLICY "Enable delete for plan owners" ON public.workout_plans FOR DELETE USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = workout_plans.plan_id AND plans.user_id = auth.uid())));


-- Workout exercises details
CREATE TABLE public.workout_exercises (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    workout_plan_id bigint REFERENCES public.workout_plans(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    sets integer,
    reps text, -- "8-12" or "to failure"
    rest_seconds integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for plan owners" ON public.workout_exercises FOR SELECT USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans p JOIN public.workout_plans wp ON p.id = wp.plan_id WHERE wp.id = workout_exercises.workout_plan_id AND p.user_id = auth.uid())));
CREATE POLICY "Enable insert for plan owners" ON public.workout_exercises FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans p JOIN public.workout_plans wp ON p.id = wp.plan_id WHERE wp.id = workout_exercises.workout_plan_id AND p.user_id = auth.uid())));
CREATE POLICY "Enable update for plan owners" ON public.workout_exercises FOR UPDATE USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans p JOIN public.workout_plans wp ON p.id = wp.plan_id WHERE wp.id = workout_exercises.workout_plan_id AND p.user_id = auth.uid())));
CREATE POLICY "Enable delete for plan owners" ON public.workout_exercises FOR DELETE USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans p JOIN public.workout_plans wp ON p.id = wp.plan_id WHERE wp.id = workout_exercises.workout_plan_id AND p.user_id = auth.uid())));


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
  name TEXT DEFAULT 'Мой план тренировок' NOT NULL,
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