const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hftdftotumdlwifrqzes.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmdGRmdG90dW1kbHdpZnJxemVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzU4MDc5NywiZXhwIjoyMDYzMTU2Nzk3fQ.x_cDUHmtAvVz-2n5iBXqYZw_Qify_0MKCo28Nw6hZ5k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  try {
    console.log('🔍 Проверяю структуру базы данных...');

    // Проверяем существующие таблицы
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('❌ Ошибка при получении списка таблиц:', tablesError);
    } else {
      console.log('📋 Существующие таблицы:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }

    // Проверяем структуру таблицы users
    const { data: userColumns, error: userColumnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'users');

    if (userColumnsError) {
      console.error('❌ Ошибка при получении структуры таблицы users:', userColumnsError);
    } else {
      console.log('\n👤 Структура таблицы users:');
      userColumns.forEach(column => {
        console.log(`  - ${column.column_name}: ${column.data_type}`);
      });
    }

    // Проверяем доступные функции
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .eq('routine_schema', 'public');

    if (functionsError) {
      console.error('❌ Ошибка при получении списка функций:', functionsError);
    } else {
      console.log('\n⚙️ Доступные функции:');
      functions.forEach(func => {
        console.log(`  - ${func.routine_name} (${func.routine_type})`);
      });
    }

  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
  }
}

checkDatabase(); 