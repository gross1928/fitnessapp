import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { calculateBMR, calculateTDEE } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const telegramId = request.headers.get('x-telegram-user-id')
    
    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'Telegram ID не найден' },
        { status: 401 }
      )
    }

    const {
      telegram_username,
      name,
      age,
      height,
      gender,
      current_weight,
      target_weight,
      goal_timeframe,
      activity_level,
      goal
    } = body

    // Валидация обязательных полей
    if (!name || !age || !height || !gender || !current_weight || !target_weight || !goal) {
      return NextResponse.json(
        { success: false, error: 'Не все обязательные поля заполнены' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Рассчитываем базовые метрики
    const bmr = calculateBMR(current_weight, height, age, gender)
    const tdee = calculateTDEE(bmr, activity_level)
    
    // Рассчитываем целевые калории в зависимости от цели
    let dailyCalories = tdee
    if (goal === 'lose') {
      dailyCalories = tdee - 500 // дефицит 500 ккал для похудения
    } else if (goal === 'gain') {
      dailyCalories = tdee + 500 // профицит 500 ккал для набора веса
    }

    // Проверяем, существует ли пользователь
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', parseInt(telegramId))
      .single()

    if (existingUser) {
      // Обновляем существующего пользователя
      const { data: user, error } = await supabase
        .from('users')
        .update({
          telegram_username,
          name,
          age,
          height,
          gender,
          current_weight,
          target_weight,
          goal_timeframe,
          activity_level,
          goal,
          bmr: Math.round(bmr),
          tdee: Math.round(tdee),
          daily_calories: Math.round(dailyCalories),
          is_onboarded: true,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', parseInt(telegramId))
        .select()
        .single()

      if (error) {
        console.error('Ошибка обновления пользователя:', error)
        return NextResponse.json(
          { success: false, error: 'Ошибка обновления данных' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: user,
        message: 'Профиль обновлен успешно!'
      })
    } else {
      // Создаем нового пользователя
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          telegram_id: parseInt(telegramId),
          telegram_username,
          name,
          age,
          height,
          gender,
          current_weight,
          target_weight,
          goal_timeframe,
          activity_level,
          goal,
          bmr: Math.round(bmr),
          tdee: Math.round(tdee),
          daily_calories: Math.round(dailyCalories),
          is_onboarded: true
        })
        .select()
        .single()

      if (error) {
        console.error('Ошибка создания пользователя:', error)
        return NextResponse.json(
          { success: false, error: 'Ошибка создания профиля' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: user,
        message: 'Добро пожаловать в ДаЕда! Ваш профиль создан.'
      })
    }

  } catch (error) {
    console.error('Ошибка API онбординга:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 