# ДаЕда - Персональный AI-коуч по здоровью 🏃‍♀️💚

Современное WebApp приложение для Telegram бота с AI-коучем по здоровью и питанию. Интеграция с OpenAI API и Supabase для персональных рекомендаций и трекинга прогресса.

## 🌟 Основные возможности

### 🤖 AI-коуч с OpenAI
- Персональные рекомендации по питанию и здоровью
- Анализ фотографий еды с определением калорий и БЖУ
- Интеллектуальный анализ медицинских анализов
- Контекстный чат с учетом ваших целей и особенностей

### 📱 Онбординг и персонализация
- Детальный онбординг с вопросами о целях
- Расчет индивидуальных норм питания
- Учет активности, возраста, роста и веса
- Персональные рекомендации и планы

### 🍎 Трекинг питания
- Загрузка фото еды с AI-анализом
- Автоматическое определение калорий и БЖУ
- Ведение дневника питания
- Статистика по приемам пищи

### 💧 Контроль водного баланса
- Ручной ввод потребления воды
- Команды в чат-боте ("Я выпил 2 стакана воды")
- Визуализация прогресса по воде
- Напоминания о питье

### 📋 Анализ здоровья
- Загрузка PDF/фото/текст анализов крови, мочи, гормонов
- AI-анализ медицинских показателей
- Персональные рекомендации на основе анализов
- История и трекинг изменений

### 📊 Дашборд и аналитика
- Современный интерфейс с метриками здоровья
- Графики прогресса по неделям и месяцам
- Цветовая кодировка показателей
- Трекинг веса, активности и целей

## 🎨 Дизайн и UI

- **Современный минималистичный интерфейс** уровня Apple/Zero/Human
- **Цветовая кодировка метрик:**
  - 🧡 Еда (КБЖУ) — оранжевые карточки
  - 💙 Вода — синие карточки  
  - ❤️ Пульс — красные карточки
  - 💚 Вес — зелёные карточки
  - 💜 Сон — фиолетовые карточки
  - ⚪ Анализы — серые/нейтральные карточки
- **Мягкие тени и закругленные углы** (radius 2xl)
- **Поддержка тёмной темы** через Telegram
- **Плавные анимации** и переходы
- **Адаптивная типографика** и иконки Lucide

## 🛠 Технологический стек

- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui компоненты
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **AI:** OpenAI API (GPT-4, GPT-4 Vision)
- **Deployment:** Railway
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Date handling:** date-fns

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-username/daeda-health-coach.git
cd daeda-health-coach
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret

# App Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Выполните SQL скрипт из `supabase/schema.sql` в SQL Editor
3. Настройте Row Level Security (RLS) политики
4. Получите API ключи из Settings → API

### 5. Настройка OpenAI

1. Получите API ключ на [platform.openai.com](https://platform.openai.com)
2. Убедитесь, что у вас есть доступ к GPT-4 и GPT-4 Vision
3. Добавьте ключ в переменные окружения

### 6. Запуск в разработке
```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:3000`

## 🚢 Деплой на Railway

### 1. Подготовка
```bash
# Установите Railway CLI
npm install -g @railway/cli

# Логин в Railway
railway login
```

### 2. Деплой
```bash
# Инициализация проекта
railway init

# Настройка переменных окружения в Railway dashboard
railway variables:set NEXT_PUBLIC_SUPABASE_URL=your-url
railway variables:set NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
railway variables:set OPENAI_API_KEY=your-openai-key

# Деплой
git add .
git commit -m "Initial deployment"
git push origin main

# Railway автоматически развернет ваше приложение
```

### 3. Настройка домена (опционально)
```bash
# Настройка кастомного домена
railway domain:add yourdomain.com
```

## 📱 Интеграция с Telegram

### 1. Создание бота
1. Найдите [@BotFather](https://t.me/botfather) в Telegram
2. Создайте нового бота: `/newbot`
3. Получите Bot Token
4. Настройте WebApp: `/newapp`

### 2. Настройка WebApp
```bash
# Укажите URL вашего приложения
https://your-railway-app.railway.app

# Настройте короткое имя
daeda_health_coach
```

### 3. Настройка Webhook (опционально)
```bash
curl -X POST \
  https://api.telegram.org/bot{YOUR_BOT_TOKEN}/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://your-railway-app.railway.app/api/telegram/webhook",
    "secret_token": "your-webhook-secret"
  }'
```

## 🗂 Структура проекта

```
daeda-health-coach/
├── 📁 app/                     # Next.js 14 App Router
│   ├── globals.css            # Глобальные стили
│   ├── layout.tsx             # Основной layout
│   ├── page.tsx               # Главная страница (дашборд)
│   └── 📁 api/                # API routes
├── 📁 components/             # React компоненты
│   ├── 📁 ui/                 # Базовые UI компоненты
│   ├── 📁 health/             # Компоненты для здоровья
│   └── 📁 forms/              # Формы
├── 📁 lib/                    # Утилиты и конфигурация
│   ├── supabase.ts            # Конфигурация Supabase
│   ├── openai.ts              # OpenAI API интеграция
│   └── utils.ts               # Общие утилиты
├── 📁 types/                  # TypeScript типы
│   ├── index.ts               # Основные типы
│   └── database.ts            # Типы базы данных
├── 📁 supabase/               # SQL схемы и миграции
├── 📄 package.json            # Зависимости
├── 📄 tailwind.config.js      # Конфигурация Tailwind
├── 📄 next.config.js          # Конфигурация Next.js
└── 📄 railway.toml            # Конфигурация Railway
```

## 🔧 API Endpoints

### Пользователи
- `GET /api/users/profile` - Получение профиля
- `PUT /api/users/profile` - Обновление профиля
- `POST /api/users/onboarding` - Завершение онбординга

### Питание
- `POST /api/nutrition/analyze-food` - Анализ фото еды
- `POST /api/nutrition/add-meal` - Добавление приема пищи
- `GET /api/nutrition/daily` - Дневная статистика
- `GET /api/nutrition/history` - История питания

### Вода
- `POST /api/water/add` - Добавление воды
- `GET /api/water/daily` - Дневное потребление

### Здоровье
- `POST /api/health/analyze` - Анализ медицинских данных
- `GET /api/health/analyses` - История анализов

### AI Чат
- `POST /api/chat/message` - Отправка сообщения
- `GET /api/chat/history` - История чата

## 🎯 Использование

### 1. Онбординг
При первом запуске пользователь проходит онбординг:
- Указывает имя, возраст, рост, вес
- Выбирает цель (похудение/набор/поддержание веса)
- Указывает уровень активности
- Устанавливает срок достижения цели

### 2. Ежедневное использование
- **Добавление еды:** Фото → AI анализ → Сохранение в дневник
- **Трекинг воды:** Быстрые кнопки или команды в чат
- **Взвешивание:** Регулярные записи веса и состава тела
- **AI-советы:** Получение персональных рекомендаций

### 3. Анализ здоровья
- Загрузка файлов анализов (PDF/фото/текст)
- AI анализирует показатели
- Получение рекомендаций и выявление рисков
- Отслеживание динамики показателей

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature ветку: `git checkout -b feature/amazing-feature`
3. Commit изменения: `git commit -m 'Add amazing feature'`
4. Push в ветку: `git push origin feature/amazing-feature`
5. Откройте Pull Request

## 📝 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

## 🆘 Поддержка

Если у вас возникли вопросы или проблемы:

1. 📖 Проверьте документацию
2. 🐛 Создайте Issue на GitHub
3. 💬 Напишите в Telegram: [@your_support_bot](https://t.me/your_support_bot)

## 🚧 Roadmap

- [ ] Интеграция с фитнес-трекерами (Apple Health, Google Fit)
- [ ] Голосовые команды для добавления данных
- [ ] Социальные функции (челленджи, друзья)
- [ ] Интеграция с врачами и нутрициологами
- [ ] Машинное обучение для персонализации
- [ ] Offline режим и синхронизация

---

**ДаЕда** - твой персональный AI-коуч для здоровой и счастливой жизни! 💚🤖

Made with ❤️ by ДаЕда Team 