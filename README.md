# ДаЕда - AI Health Coach

Персональный AI-коуч по здоровью с интеграцией Telegram

## Быстрый запуск

### 1. Настройка базы данных Supabase

**ВАЖНО**: Для работы приложения необходимо применить схему базы данных к вашему проекту Supabase.

#### Шаги настройки:

1. Перейдите в ваш проект Supabase: https://app.supabase.com/
2. Откройте раздел "SQL Editor" в левом меню
3. Создайте новый запрос и скопируйте весь содержимый файла `supabase.md`
4. Выполните запрос, нажав "Run"
5. Затем выполните дополнительный SQL из файла `supabase/schema.sql` для создания таблиц предпочтений

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

## Функциональность планов

### Логика работы планов

В нижнем меню быстрого доступа расположены две кнопки: **«План тренировок»** и **«План питания»**.

#### Первое посещение:
1. Пользователь нажимает на кнопку плана
2. Запускается онбординг с вопросами о предпочтениях
3. После ответов автоматически генерируется план
4. Пользователь видит результат с кнопками **«Сохранить план»** и **«Сгенерировать новый»**

#### Последующие посещения:
- **Если план сохранен**: пользователь сразу попадает на сохраненный план
- **Если план не сохранен**: снова показывается онбординг

#### Кнопки на странице плана:
- **«Сохранить план»**: сохраняет текущий план, при следующих посещениях он будет загружаться автоматически
- **«Сгенерировать новый»**: создает новый план без повторного прохождения онбординга

### API Endpoints

#### Планы:
- `GET /api/plans/get?planType=workout|nutrition` - Получение сохраненного плана
- `POST /api/plans/save` - Сохранение плана
- `GET /api/plans/preferences?planType=workout|nutrition` - Получение предпочтений
- `POST /api/plans/preferences` - Сохранение предпочтений

#### Генерация планов:
- `POST /api/workout-plans/generate` - Генерация плана тренировок
- `POST /api/nutrition-plans/generate` - Генерация плана питания

#### Пользователи:
- `POST /api/users/register` - Регистрация пользователя
- `GET /api/users/profile` - Получение профиля пользователя
- `PUT /api/users/profile` - Обновление профиля

#### Питание:
- `POST /api/nutrition/analyze-food` - Анализ пищи AI
- `POST /api/nutrition/save-meal` - Сохранение приема пищи
- `GET /api/nutrition/stats` - Статистика питания
- `POST /api/nutrition/water` - Добавление воды
- `GET /api/nutrition/water` - Получение данных о воде

#### Чат:
- `POST /api/chat` - Отправка сообщения в чат
- `GET /api/chat` - Получение истории чата

#### Telegram:
- `POST /api/telegram/webhook` - Telegram webhook

## Структура базы данных

### Основные таблицы:
- `users` - Профили пользователей
- `meal_entries` - Записи приемов пищи
- `water_entries` - Записи потребления воды
- `weight_entries` - Записи веса
- `health_analyses` - Анализы здоровья
- `chat_messages` - Сообщения чата с AI

### Таблицы планов:
- `user_workout_plans` - Сохраненные планы тренировок
- `user_nutrition_plans` - Сохраненные планы питания
- `user_workout_preferences` - Предпочтения тренировок
- `user_nutrition_preferences` - Предпочтения питания

### Дополнительные таблицы:
- `food_items` - Продукты питания
- `food_analysis` - Анализ фотографий еды
- `fitness_data` - Фитнес-данные

## Проблемы и их решение

### Ошибка "relation does not exist"
Если вы видите ошибку типа `relation "public.users" does not exist`, значит схема базы данных не была применена. Выполните инструкции из раздела "Настройка базы данных Supabase" выше.

### Проблемы с авторизацией
Убедитесь, что:
1. Переменные окружения корректно настроены
2. Row Level Security включена в Supabase
3. Политики безопасности применены (это делается автоматически через schema.sql)

### Проблемы с сохранением планов
1. Проверьте, что таблицы `user_workout_plans` и `user_nutrition_plans` созданы
2. Убедитесь, что RLS политики настроены правильно
3. Проверьте логи в консоли браузера

## Архитектура

- **Frontend**: Next.js 14 с App Router
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **Styling**: Tailwind CSS + Radix UI
- **Authentication**: Telegram WebApp
- **Notifications**: Custom Toast компонент

## Разработка

### Структура проекта:
```
app/
├── api/           # API endpoints
├── chat/          # Страница чата
├── nutrition/     # Страницы питания
├── nutrition-plans/ # Страница планов питания
├── workout-plans/ # Страница планов тренировок
├── onboarding/    # Страница онбординга
└── page.tsx       # Главная страница

components/
├── ui/            # UI компоненты
├── nutrition/     # Компоненты питания
└── health/        # Компоненты здоровья

lib/
├── supabase.ts    # Конфигурация Supabase
├── openai.ts      # Конфигурация OpenAI
└── utils.ts       # Утилиты
```

### Добавление новых функций:
1. Создайте API endpoint в `app/api/`
2. Добавьте страницу в `app/` если нужно
3. Создайте компоненты в `components/`
4. Обновите типы в `types/`
5. При необходимости добавьте таблицы в базу данных

## Деплой

Приложение готово к деплою на Railway, Vercel или другие платформы. Убедитесь, что все переменные окружения настроены в продакшене. 