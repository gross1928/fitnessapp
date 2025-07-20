const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hftdftotumdlwifrqzes.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmdGRmdG90dW1kbHdpZnJxemVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzU4MDc5NywiZXhwIjoyMDYzMTU2Nzk3fQ.x_cDUHmtAvVz-2n5iBXqYZw_Qify_0MKCo28Nw6hZ5k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateDatabase() {
  try {
    console.log('🔄 Начинаю обновление базы данных...');

    // 1. Добавляем поле nutrition_preferences в таблицу users
    console.log('📝 Добавляю поле nutrition_preferences в таблицу users...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS nutrition_preferences JSONB;'
    });

    if (alterError) {
      console.error('❌ Ошибка при добавлении поля nutrition_preferences:', alterError);
    } else {
      console.log('✅ Поле nutrition_preferences добавлено успешно');
    }

    // 2. Создаем таблицу user_workout_plans если её нет
    console.log('🏋️ Создаю таблицу user_workout_plans...');
    const { error: workoutTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_workout_plans (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          plan_data JSONB NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (workoutTableError) {
      console.error('❌ Ошибка при создании таблицы user_workout_plans:', workoutTableError);
    } else {
      console.log('✅ Таблица user_workout_plans создана успешно');
    }

    // 3. Создаем таблицу user_nutrition_plans если её нет
    console.log('🥗 Создаю таблицу user_nutrition_plans...');
    const { error: nutritionTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_nutrition_plans (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          plan_data JSONB NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (nutritionTableError) {
      console.error('❌ Ошибка при создании таблицы user_nutrition_plans:', nutritionTableError);
    } else {
      console.log('✅ Таблица user_nutrition_plans создана успешно');
    }

    // 4. Добавляем индексы
    console.log('📊 Добавляю индексы...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_user_workout_plans_user_id ON user_workout_plans(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_nutrition_plans_user_id ON user_nutrition_plans(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_workout_plans_active ON user_workout_plans(user_id, is_active);
        CREATE INDEX IF NOT EXISTS idx_user_nutrition_plans_active ON user_nutrition_plans(user_id, is_active);
      `
    });

    if (indexError) {
      console.error('❌ Ошибка при создании индексов:', indexError);
    } else {
      console.log('✅ Индексы созданы успешно');
    }

    // 5. Включаем RLS для новых таблиц
    console.log('🔒 Включаю RLS для новых таблиц...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_workout_plans ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_nutrition_plans ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.error('❌ Ошибка при включении RLS:', rlsError);
    } else {
      console.log('✅ RLS включен успешно');
    }

    // 6. Создаем RLS политики
    console.log('🛡️ Создаю RLS политики...');
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users own workout plans" ON user_workout_plans;
        CREATE POLICY "Users own workout plans" ON user_workout_plans
          FOR ALL USING (user_id = (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));

        DROP POLICY IF EXISTS "Users own nutrition plans" ON user_nutrition_plans;
        CREATE POLICY "Users own nutrition plans" ON user_nutrition_plans
          FOR ALL USING (user_id = (SELECT id FROM users WHERE telegram_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'telegram_id')::bigint));
      `
    });

    if (policyError) {
      console.error('❌ Ошибка при создании политик:', policyError);
    } else {
      console.log('✅ RLS политики созданы успешно');
    }

    // 7. Создаем триггеры для updated_at
    console.log('⏰ Создаю триггеры для updated_at...');
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (triggerError) {
      console.error('❌ Ошибка при создании триггеров:', triggerError);
    } else {
      console.log('✅ Триггеры созданы успешно');
    }

    console.log('🎉 Обновление базы данных завершено успешно!');

  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
  }
}

updateDatabase(); 