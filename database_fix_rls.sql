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