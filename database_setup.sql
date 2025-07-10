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