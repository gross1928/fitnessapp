#!/usr/bin/env pwsh

Write-Host "🚀 Развертывание исправлений для анализа еды..." -ForegroundColor Green

# Коммит изменений
Write-Host "📝 Коммит изменений..." -ForegroundColor Yellow
git add .
git commit -m "🔧 Исправление ошибок анализа еды:

- Исправлена ошибка 'Cannot read properties of undefined (reading calories)'
- Добавлена таблица food_analysis в схему БД
- API теперь возвращает данные в правильном формате NutritionData
- Улучшена обработка файлов изображений
- Добавлена валидация данных анализа

Изменения:
- app/api/nutrition/analyze-food/route.ts
- supabase/schema.sql
- supabase/migrate.sql"

# Пуш в GitHub
Write-Host "⬆️ Пуш в GitHub..." -ForegroundColor Blue
git push origin master

Write-Host "✅ Изменения успешно развернуты!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Откройте Supabase Dashboard: https://app.supabase.com" -ForegroundColor White
Write-Host "2. Перейдите в SQL Editor" -ForegroundColor White
Write-Host "3. Выполните содержимое файла supabase/migrate.sql" -ForegroundColor White
Write-Host "4. Проверьте, что таблица food_analysis создана" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Или выполните миграцию через CLI:" -ForegroundColor Yellow
Write-Host "supabase db reset" -ForegroundColor Gray
Write-Host ""
Write-Host "После применения миграции приложение должно работать корректно!" -ForegroundColor Green 