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

    // Получаем профиль пользователя
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', parseInt(telegramId))
      .single()

    if (error) {
      console.error('Ошибка получения профиля:', error)
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

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
    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_id', parseInt(telegramId))
      .select()
      .single()

    if (error) {
      console.error('Ошибка обновления профиля:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка обновления профиля' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
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