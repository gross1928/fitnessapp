-- Создание таблиц для приложения ДаЕда

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    name TEXT,
    age INTEGER,
    height NUMERIC,
    gender TEXT,
    current_weight NUMERIC,
    target_weight NUMERIC,
    goal_type TEXT,
    goal_deadline DATE,
    activity_level TEXT,
    daily_calorie_target INTEGER,
    daily_protein_target INTEGER,
    daily_fat_target INTEGER,
    daily_carb_target INTEGER,
    daily_water_target INTEGER,
    allergies TEXT[],
    health_conditions TEXT[],
    nutrition_preferences JSONB,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица записей приемов пищи
CREATE TABLE IF NOT EXISTS public.meal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    food_item_id UUID,
    food_name TEXT,
    meal_type TEXT,
    amount NUMERIC,
    calories INTEGER,
    proteins NUMERIC,
    fats NUMERIC,
    carbs NUMERIC,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица записей потребления воды
CREATE TABLE IF NOT EXISTS public.water_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица записей веса
CREATE TABLE IF NOT EXISTS public.weight_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    weight NUMERIC NOT NULL,
    body_fat_percentage NUMERIC,
    muscle_mass NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица продуктов питания
CREATE TABLE IF NOT EXISTS public.food_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    calories_per_100g INTEGER NOT NULL,
    proteins_per_100g NUMERIC NOT NULL,
    fats_per_100g NUMERIC NOT NULL,
    carbs_per_100g NUMERIC NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица анализов здоровья
CREATE TABLE IF NOT EXISTS public.health_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT,
    raw_data TEXT,
    ai_analysis TEXT NOT NULL,
    key_findings TEXT[] NOT NULL,
    recommendations TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица сообщений чата
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица предпочтений питания
CREATE TABLE IF NOT EXISTS public.user_nutrition_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    allergies TEXT[] DEFAULT '{}',
    likes TEXT[] DEFAULT '{}',
    dislikes TEXT[] DEFAULT '{}',
    budget TEXT DEFAULT 'medium',
    cooking_time TEXT DEFAULT 'medium',
    meals_per_day INTEGER DEFAULT 3,
    dietary_restrictions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица предпочтений тренировок
CREATE TABLE IF NOT EXISTS public.user_workout_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    experience TEXT DEFAULT 'beginner',
    available_days INTEGER[] DEFAULT '{1,3,5}',
    session_duration TEXT DEFAULT 'medium',
    equipment TEXT[] DEFAULT '{}',
    injuries TEXT[] DEFAULT '{}',
    fitness_level INTEGER DEFAULT 5,
    preferred_exercises TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица планов питания
CREATE TABLE IF NOT EXISTS public.user_nutrition_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    plan_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица планов тренировок
CREATE TABLE IF NOT EXISTS public.user_workout_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    plan_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица фитнес-данных
CREATE TABLE IF NOT EXISTS public.fitness_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    steps INTEGER,
    heart_rate INTEGER,
    sleep_hours NUMERIC,
    body_temperature NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица анализа пищи
CREATE TABLE IF NOT EXISTS public.food_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    meal_entry_id UUID REFERENCES public.meal_entries(id) ON DELETE CASCADE,
    image_url TEXT,
    analysis_provider TEXT,
    confidence_score NUMERIC,
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица записей продуктов
CREATE TABLE IF NOT EXISTS public.food_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    food_name TEXT NOT NULL,
    calories INTEGER,
    protein NUMERIC,
    fats NUMERIC,
    carbs NUMERIC,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица отчетов о здоровье
CREATE TABLE IF NOT EXISTS public.health_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    file_url TEXT,
    analysis_result TEXT,
    recommendations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица профилей пользователей
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER,
    height NUMERIC,
    current_weight NUMERIC,
    target_weight NUMERIC,
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_meal_entries_user_id ON public.meal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_entries_created_at ON public.meal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_water_entries_user_id ON public.water_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_water_entries_created_at ON public.water_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_id ON public.weight_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_entries_created_at ON public.weight_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_user_id ON public.user_nutrition_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_active ON public.user_nutrition_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON public.user_workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_active ON public.user_workout_plans(is_active);

-- Функции для получения дневной статистики питания
CREATE OR REPLACE FUNCTION get_daily_nutrition(user_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    total_calories INTEGER,
    total_proteins NUMERIC,
    total_fats NUMERIC,
    total_carbs NUMERIC,
    meal_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(me.calories), 0)::INTEGER as total_calories,
        COALESCE(SUM(me.proteins), 0) as total_proteins,
        COALESCE(SUM(me.fats), 0) as total_fats,
        COALESCE(SUM(me.carbs), 0) as total_carbs,
        COUNT(*) as meal_count
    FROM public.meal_entries me
    WHERE me.user_id = user_uuid 
    AND DATE(me.created_at) = target_date;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения дневного потребления воды
CREATE OR REPLACE FUNCTION get_daily_water(user_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    total_water INTEGER,
    entry_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(we.amount), 0)::INTEGER as total_water,
        COUNT(*) as entry_count
    FROM public.water_entries we
    WHERE we.user_id = user_uuid 
    AND DATE(we.created_at) = target_date;
END;
$$ LANGUAGE plpgsql;

-- Включение Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_nutrition_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workout_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для пользователей
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Политики для записей приемов пищи
CREATE POLICY "Users can view own meal entries" ON public.meal_entries
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own meal entries" ON public.meal_entries
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own meal entries" ON public.meal_entries
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own meal entries" ON public.meal_entries
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Политики для записей воды
CREATE POLICY "Users can view own water entries" ON public.water_entries
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own water entries" ON public.water_entries
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Политики для записей веса
CREATE POLICY "Users can view own weight entries" ON public.weight_entries
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own weight entries" ON public.weight_entries
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Политики для сообщений чата
CREATE POLICY "Users can view own chat messages" ON public.chat_messages
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Политики для планов
CREATE POLICY "Users can view own nutrition plans" ON public.user_nutrition_plans
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own nutrition plans" ON public.user_nutrition_plans
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own nutrition plans" ON public.user_nutrition_plans
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own workout plans" ON public.user_workout_plans
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own workout plans" ON public.user_workout_plans
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own workout plans" ON public.user_workout_plans
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Политики для предпочтений
CREATE POLICY "Users can view own nutrition preferences" ON public.user_nutrition_preferences
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own nutrition preferences" ON public.user_nutrition_preferences
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own nutrition preferences" ON public.user_nutrition_preferences
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own workout preferences" ON public.user_workout_preferences
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own workout preferences" ON public.user_workout_preferences
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own workout preferences" ON public.user_workout_preferences
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Политики для анализов здоровья
CREATE POLICY "Users can view own health analyses" ON public.health_analyses
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own health analyses" ON public.health_analyses
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Политики для продуктов питания
CREATE POLICY "Users can view own food items" ON public.food_items
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own food items" ON public.food_items
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Политики для фитнес-данных
CREATE POLICY "Users can view own fitness data" ON public.fitness_data
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own fitness data" ON public.fitness_data
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Политики для анализа пищи
CREATE POLICY "Users can view own food analysis" ON public.food_analysis
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own food analysis" ON public.food_analysis
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Политики для записей продуктов
CREATE POLICY "Users can view own food entries" ON public.food_entries
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own food entries" ON public.food_entries
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Политики для отчетов о здоровье
CREATE POLICY "Users can view own health reports" ON public.health_reports
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own health reports" ON public.health_reports
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Политики для профилей пользователей
CREATE POLICY "Users can view own user profiles" ON public.user_profiles
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own user profiles" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own user profiles" ON public.user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id::text); 

-- Дополнительные таблицы для предпочтений пользователей
-- Выполните этот SQL в Supabase для добавления недостающих таблиц

-- Таблица предпочтений питания
CREATE TABLE IF NOT EXISTS user_nutrition_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    allergies TEXT[] DEFAULT '{}',
    likes TEXT[] DEFAULT '{}',
    dislikes TEXT[] DEFAULT '{}',
    budget TEXT DEFAULT 'medium',
    cooking_time TEXT DEFAULT 'medium',
    meals_per_day INTEGER DEFAULT 3,
    dietary_restrictions TEXT[] DEFAULT '{}',
    goals TEXT DEFAULT 'maintain',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица предпочтений тренировок
CREATE TABLE IF NOT EXISTS user_workout_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    experience TEXT DEFAULT 'beginner',
    available_days INTEGER[] DEFAULT '{1,3,5}',
    session_duration TEXT DEFAULT 'medium',
    equipment TEXT[] DEFAULT '{}',
    injuries TEXT[] DEFAULT '{}',
    fitness_level INTEGER DEFAULT 5,
    preferred_exercises TEXT[] DEFAULT '{}',
    goals TEXT DEFAULT 'improve_strength',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_user_nutrition_preferences_user_id ON user_nutrition_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_preferences_user_id ON user_workout_preferences(user_id);

-- Включение RLS
ALTER TABLE user_nutrition_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workout_preferences ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для предпочтений питания
CREATE POLICY "Users own nutrition preferences" ON user_nutrition_preferences
    FOR ALL USING (user_id = (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

-- Политики безопасности для предпочтений тренировок
CREATE POLICY "Users own workout preferences" ON user_workout_preferences
    FOR ALL USING (user_id = (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_user_nutrition_preferences_updated_at 
    BEFORE UPDATE ON user_nutrition_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_workout_preferences_updated_at 
    BEFORE UPDATE ON user_workout_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблицам
COMMENT ON TABLE user_nutrition_preferences IS 'Предпочтения пользователя по питанию';
COMMENT ON TABLE user_workout_preferences IS 'Предпочтения пользователя по тренировкам'; 