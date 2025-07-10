import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { calculateBMR, calculateTDEE } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const telegramId = request.headers.get('x-telegram-user-id')
    
    console.log('Онбординг для telegram_id:', telegramId)
    console.log('Данные тела запроса:', body)
    
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
      console.error('Не все обязательные поля заполнены:', {
        name: !!name,
        age: !!age,
        height: !!height,
        gender: !!gender,
        current_weight: !!current_weight,
        target_weight: !!target_weight,
        goal: !!goal
      })
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

    console.log('Расчетные данные:', { bmr, tdee, dailyCalories })

    // Проверяем, существует ли пользователь
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', parseInt(telegramId))

    if (checkError) {
      console.error('Ошибка проверки существующего пользователя:', checkError)
      return NextResponse.json(
        { success: false, error: 'Ошибка проверки пользователя' },
        { status: 500 }
      )
    }

    const existingUser = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null

    if (existingUser) {
      console.log('Обновляем существующего пользователя:', existingUser.id)
      
      // Обновляем существующего пользователя
      const { data: users, error } = await supabase
        .from('users')
        .update({
          username: telegram_username,
          name,
          age,
          height,
          gender,
          current_weight,
          target_weight,
          goal_deadline: goal_timeframe ? new Date(Date.now() + goal_timeframe * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
          activity_level,
          goal_type: goal,
          daily_calorie_target: Math.round(dailyCalories),
          daily_protein_target: Math.round(current_weight * 2), // 2г белка на кг веса
          daily_fat_target: Math.round(dailyCalories * 0.25 / 9), // 25% от калорий
          daily_carb_target: Math.round((dailyCalories - (current_weight * 2 * 4) - (dailyCalories * 0.25)) / 4), // остальное
          daily_water_target: Math.round(current_weight * 35), // 35мл на кг веса
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', parseInt(telegramId))
        .select()

      if (error) {
        console.error('Ошибка обновления пользователя:', error)
        return NextResponse.json(
          { success: false, error: 'Ошибка обновления данных' },
          { status: 500 }
        )
      }

      if (!users || users.length === 0) {
        console.error('Пользователь не найден для обновления')
        return NextResponse.json(
          { success: false, error: 'Пользователь не найден для обновления' },
          { status: 404 }
        )
      }

      console.log('Пользователь успешно обновлен')
      return NextResponse.json({
        success: true,
        data: users[0],
        message: 'Профиль обновлен успешно!'
      })
    } else {
      console.log('Создаем нового пользователя')
      
      // Создаем нового пользователя
      const newUserData = {
        telegram_id: parseInt(telegramId),
        username: telegram_username,
        name,
        age,
        height,
        gender,
        current_weight,
        target_weight,
        goal_deadline: goal_timeframe ? new Date(Date.now() + goal_timeframe * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
        activity_level,
        goal_type: goal,
        daily_calorie_target: Math.round(dailyCalories),
        daily_protein_target: Math.round(current_weight * 2),
        daily_fat_target: Math.round(dailyCalories * 0.25 / 9),
        daily_carb_target: Math.round((dailyCalories - (current_weight * 2 * 4) - (dailyCalories * 0.25)) / 4),
        daily_water_target: Math.round(current_weight * 35)
      }

      console.log('Данные нового пользователя:', newUserData)

      const { data: users, error } = await supabase
        .from('users')
        .insert(newUserData)
        .select()

      if (error) {
        console.error('Ошибка создания пользователя:', error)
        return NextResponse.json(
          { success: false, error: 'Ошибка создания профиля' },
          { status: 500 }
        )
      }

      if (!users || users.length === 0) {
        console.error('Пользователь не был создан')
        return NextResponse.json(
          { success: false, error: 'Пользователь не был создан' },
          { status: 500 }
        )
      }

      console.log('Пользователь успешно создан:', users[0].id)
      return NextResponse.json({
        success: true,
        data: users[0],
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