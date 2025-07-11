-- Временное отключение RLS для chat_messages для диагностики
-- ВАЖНО: Это только для отладки! Включите RLS обратно после тестирования

-- Отключить RLS
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Проверить существующие сообщения
SELECT 
    id, 
    role, 
    LEFT(content, 100) as content_preview,
    message_type,
    created_at,
    user_id
FROM chat_messages 
ORDER BY created_at DESC 
LIMIT 20;

-- ПОСЛЕ ТЕСТИРОВАНИЯ ОБЯЗАТЕЛЬНО ВКЛЮЧИТЕ RLS ОБРАТНО:
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY; 