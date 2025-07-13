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