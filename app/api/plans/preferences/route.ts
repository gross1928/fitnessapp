import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const telegramId = request.headers.get('x-telegram-user-id')
    
    console.log('🎯 Сохранение предпочтений для telegram_id:', telegramId)
    console.log('📝 Данные предпочтений:', body)
    
    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'Telegram ID не найден' },
        { status: 401 }
      )
    }

    const {
      planType, // 'nutrition' или 'workout'
      preferences
    } = body

    if (!planType || !preferences) {
      return NextResponse.json(
        { success: false, error: 'Не указан тип плана или предпочтения' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Проверяем, существует ли пользователь
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', parseInt(telegramId))
      .single()

    if (checkError || !existingUser) {
      console.error('❌ Пользователь не найден:', checkError)
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Сохраняем предпочтения в зависимости от типа плана
    if (planType === 'nutrition') {
      const { error } = await supabase
        .from('user_nutrition_preferences')
        .upsert({
          user_id: existingUser.id,
          allergies: preferences.allergies || [],
          likes: preferences.likes || [],
          dislikes: preferences.dislikes || [],
          budget: preferences.budget || 'medium',
          cooking_time: preferences.cookingTime || 'medium',
          meals_per_day: preferences.mealsPerDay || 3,
          dietary_restrictions: preferences.dietaryRestrictions || [],
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('❌ Ошибка сохранения предпочтений питания:', error)
        return NextResponse.json(
          { success: false, error: 'Ошибка сохранения предпочтений' },
          { status: 500 }
        )
      }
    } else if (planType === 'workout') {
      const { error } = await supabase
        .from('user_workout_preferences')
        .upsert({
          user_id: existingUser.id,
          experience: preferences.experience || 'beginner',
          available_days: preferences.availableDays || [],
          session_duration: preferences.sessionDuration || 'medium',
          equipment: preferences.equipment || [],
          injuries: preferences.injuries || [],
          fitness_level: preferences.fitnessLevel || 5,
          preferred_exercises: preferences.preferredExercises || [],
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('❌ Ошибка сохранения предпочтений тренировок:', error)
        return NextResponse.json(
          { success: false, error: 'Ошибка сохранения предпочтений' },
          { status: 500 }
        )
      }
    }

    console.log('✅ Предпочтения успешно сохранены')
    return NextResponse.json({
      success: true,
      message: 'Предпочтения сохранены успешно!'
    })

  } catch (error) {
    console.error('💥 Критическая ошибка API предпочтений:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-user-id')
    const planType = request.nextUrl.searchParams.get('type') // 'nutrition' или 'workout'
    
    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'Telegram ID не найден' },
        { status: 401 }
      )
    }

    if (!planType) {
      return NextResponse.json(
        { success: false, error: 'Не указан тип плана' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Получаем ID пользователя
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', parseInt(telegramId))
      .single()

    if (checkError || !existingUser) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Получаем предпочтения в зависимости от типа плана
    if (planType === 'nutrition') {
      const { data: preferences, error } = await supabase
        .from('user_nutrition_preferences')
        .select('*')
        .eq('user_id', existingUser.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Ошибка получения предпочтений питания:', error)
        return NextResponse.json(
          { success: false, error: 'Ошибка получения предпочтений' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: preferences || null
      })
    } else if (planType === 'workout') {
      const { data: preferences, error } = await supabase
        .from('user_workout_preferences')
        .select('*')
        .eq('user_id', existingUser.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Ошибка получения предпочтений тренировок:', error)
        return NextResponse.json(
          { success: false, error: 'Ошибка получения предпочтений' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: preferences || null
      })
    }

    return NextResponse.json(
      { success: false, error: 'Неверный тип плана' },
      { status: 400 }
    )

  } catch (error) {
    console.error('💥 Критическая ошибка API предпочтений:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
} 