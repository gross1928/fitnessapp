import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const telegramId = request.headers.get('x-telegram-user-id')
    
    console.log('🔐 Автоматическая регистрация для telegram_id:', telegramId)
    console.log('📱 Telegram данные:', body)
    
    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'Telegram ID не найден' },
        { status: 401 }
      )
    }

    const {
      username,
      first_name,
      last_name,
      language_code
    } = body

    // Используем service role клиент для обхода RLS
    const supabase = createServiceRoleClient()

    // Единый upsert по telegram_id без предварительной проверки
    const upsertData = {
      telegram_id: parseInt(telegramId),
      username,
      first_name,
      last_name,
      name: first_name + (last_name ? ' ' + last_name : ''),
      // created_at оставляем БД по дефолту при первом создании
      updated_at: new Date().toISOString()
    }

    console.log('📝 Upsert пользователя по telegram_id:', upsertData.telegram_id)

    const { data: users, error } = await supabase
      .from('users')
      .upsert(upsertData, { onConflict: 'telegram_id' })
      .select()

    if (error) {
      console.error('❌ Ошибка upsert пользователя:', error)
      console.error('🔍 Детали ошибки:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { 
          success: false, 
          error: `Ошибка сохранения профиля: ${error.message}`,
          details: error.details || 'Подробности недоступны'
        },
        { status: 500 }
      )
    }

    const userRow = users && users.length > 0 ? users[0] : null

    if (!userRow) {
      console.error('❌ Пользователь не был сохранен - пустой ответ upsert')
      return NextResponse.json(
        { success: false, error: 'Пользователь не был сохранен' },
        { status: 500 }
      )
    }

    // Проверяем, нужен ли онбординг по заполненности ключевых полей
    const needsOnboarding = !userRow.age || 
                           !userRow.height || 
                           !userRow.gender || 
                           !userRow.current_weight || 
                           !userRow.target_weight || 
                           !userRow.goal_type || 
                           !userRow.activity_level

    console.log('🔍 Проверка онбординга после upsert:', {
      age: !!userRow.age,
      height: !!userRow.height,
      gender: !!userRow.gender,
      current_weight: !!userRow.current_weight,
      target_weight: !!userRow.target_weight,
      goal_type: !!userRow.goal_type,
      activity_level: !!userRow.activity_level,
      needsOnboarding
    })

    return NextResponse.json({
      success: true,
      data: userRow,
      isNewUser: false,
      needsOnboarding,
      message: needsOnboarding ? 'Требуется завершить онбординг' : 'Пользователь сохранен'
    })

  } catch (error) {
    console.error('💥 Критическая ошибка API регистрации:', error)
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