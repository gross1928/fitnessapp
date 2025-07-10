# ДаЕда - AI Health Coach

Персональный AI-коуч по здоровью с интеграцией Telegram

## Быстрый запуск

### 1. Настройка базы данных Supabase

**ВАЖНО**: Для работы приложения необходимо применить схему базы данных к вашему проекту Supabase.

#### Шаги настройки:

1. Перейдите в ваш проект Supabase: https://app.supabase.com/
2. Откройте раздел "SQL Editor" в левом меню
3. Создайте новый запрос и скопируйте весь содержимый файла `supabase/schema.sql`
4. Выполните запрос, нажав "Run"

#### Альтернативный способ через CLI:

```bash
# Установите Supabase CLI если еще не установлен
npm install -g @supabase/cli

# Войдите в аккаунт
supabase login

# Подключитесь к вашему проекту
supabase link --project-ref your-project-ref

# Примените миграции
supabase db push
```

### 2. Настройка переменных окружения

Создайте файл `.env.local` на основе `env.template`:

```bash
cp env.template .env.local
```

Заполните переменные:
- `NEXT_PUBLIC_SUPABASE_URL` - URL вашего проекта Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon ключ из настроек проекта
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role ключ (секретный)
- `OPENAI_API_KEY` - Ваш API ключ OpenAI

### 3. Установка зависимостей

```bash
npm install
```

### 4. Запуск приложения

```bash
npm run dev
```

## Проблемы и их решение

### Ошибка "relation does not exist"

Если вы видите ошибку типа `relation "public.users" does not exist`, значит схема базы данных не была применена. Выполните инструкции из раздела "Настройка базы данных Supabase" выше.

### Проблемы с авторизацией

Убедитесь, что:
1. Переменные окружения корректно настроены
2. Row Level Security включена в Supabase
3. Политики безопасности применены (это делается автоматически через schema.sql)

## Архитектура

- **Frontend**: Next.js 14 с App Router
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **Styling**: Tailwind CSS
- **Authentication**: Telegram WebApp

## API Endpoints

- `POST /api/users/onboarding` - Создание/обновление профиля пользователя
- `GET /api/users/profile` - Получение профиля пользователя
- `PUT /api/users/profile` - Обновление профиля
- `POST /api/nutrition/analyze-food` - Анализ пищи AI
- `POST /api/telegram/webhook` - Telegram webhook

## Структура базы данных

- `users` - Профили пользователей
- `food_items` - Продукты питания
- `meal_entries` - Записи приемов пищи
- `water_entries` - Записи потребления воды
- `weight_entries` - Записи веса
- `health_analyses` - Анализы здоровья
- `chat_messages` - Сообщения чата с AI 