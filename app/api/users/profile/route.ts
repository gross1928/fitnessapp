import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Получаем Telegram данные из заголовков или query параметров
    const telegramId = request.headers.get('x-telegram-user-id')
    
    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'Telegram ID не найден' },
        { status: 401 }
      )
    }

    console.log('Ищем пользователя с telegram_id:', telegramId)

    // Получаем профиль пользователя без .single() для лучшей обработки ошибок
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', parseInt(telegramId))

    if (error) {
      console.error('Ошибка запроса к БД:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка базы данных' },
        { status: 500 }
      )
    }

    // Проверяем, найден ли пользователь
    if (!users || users.length === 0) {
      console.log('Пользователь не найден, нужен онбординг')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Пользователь не найден',
          needsOnboarding: true 
        },
        { status: 404 }
      )
    }

    const user = users[0]
    console.log('Пользователь найден:', user.name || user.telegram_id)

    return NextResponse.json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('Ошибка API профиля:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    
    const telegramId = request.headers.get('x-telegram-user-id')
    
    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'Telegram ID не найден' },
        { status: 401 }
      )
    }

    // Обновляем профиль пользователя
    const { data: users, error } = await supabase
      .from('users')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_id', parseInt(telegramId))
      .select()

    if (error) {
      console.error('Ошибка обновления профиля:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка обновления профиля' },
        { status: 400 }
      )
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден для обновления' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: users[0],
      message: 'Профиль успешно обновлен'
    })

  } catch (error) {
    console.error('Ошибка API обновления профиля:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 