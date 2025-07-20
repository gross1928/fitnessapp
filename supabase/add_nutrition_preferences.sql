-- Добавляем поле nutrition_preferences в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS nutrition_preferences JSONB;

-- Комментарий к полю
COMMENT ON COLUMN users.nutrition_preferences IS 'Предпочтения пользователя по питанию (аллергии, предпочтения, ограничения)'; 