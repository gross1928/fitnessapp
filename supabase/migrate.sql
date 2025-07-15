-- Миграция для добавления таблицы food_analysis
-- Выполните этот скрипт в SQL Editor вашего Supabase проекта

-- Создание таблицы анализа еды (если не существует)
CREATE TABLE IF NOT EXISTS food_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meal_entry_id UUID REFERENCES meal_entries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT,
    analysis_provider TEXT NOT NULL DEFAULT 'openai',
    raw_response JSONB,
    confidence_score DECIMAL(3,2), -- значение от 0.00 до 1.00
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_food_analysis_meal_entry_id ON food_analysis(meal_entry_id);
CREATE INDEX IF NOT EXISTS idx_food_analysis_user_id ON food_analysis(user_id);

-- Проверка успешного создания
SELECT 'food_analysis table created successfully' as result; 