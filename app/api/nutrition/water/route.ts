import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json()
    const telegramId = request.headers.get('x-telegram-user-id')
    
    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'Требуется авторизация' },
        { status: 401 }
      )
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Неверное количество воды' },
        { status: 400 }
      )
    }

    if (amount > 2000) {
      return NextResponse.json(
        { success: false, error: 'Слишком большое количество за один раз (максимум 2000мл)' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Получаем пользователя
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', parseInt(telegramId))
      .single()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Получаем текущую дату
    const today = new Date().toISOString().split('T')[0]

    // Проверяем есть ли уже запись за сегодня
    const { data: existingEntry } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (existingEntry) {
      // Обновляем существующую запись
      const { data: updatedEntry, error } = await supabase
        .from('water_intake')
        .update({
          amount: existingEntry.amount + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEntry.id)
        .select()
        .single()

      if (error) {
        console.error('Ошибка обновления воды:', error)
        return NextResponse.json(
          { success: false, error: 'Ошибка сохранения данных' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          totalToday: updatedEntry.amount,
          addedAmount: amount,
          date: today
        },
        message: `Добавлено ${amount}мл воды`
      })
    } else {
      // Создаем новую запись
      const { data: newEntry, error } = await supabase
        .from('water_intake')
        .insert({
          user_id: user.id,
          amount: amount,
          date: today
        })
        .select()
        .single()

      if (error) {
        console.error('Ошибка создания записи о воде:', error)
        return NextResponse.json(
          { success: false, error: 'Ошибка сохранения данных' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          totalToday: newEntry.amount,
          addedAmount: amount,
          date: today
        },
        message: `Добавлено ${amount}мл воды`
      })
    }

  } catch (error) {
    console.error('Ошибка API воды:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// GET - получить потребление воды за сегодня
export async function GET(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-user-id')
    
    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'Требуется авторизация' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()
    
    // Получаем пользователя
    const { data: user } = await supabase
      .from('users')
      .select('id, daily_water_target')
      .eq('telegram_id', parseInt(telegramId))
      .single()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Получаем текущую дату
    const today = new Date().toISOString().split('T')[0]

    // Получаем запись за сегодня
    const { data: todayEntry } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        totalToday: todayEntry?.amount || 0,
        date: today,
        target: user.daily_water_target || 2000 // цель из профиля пользователя
      }
    })

  } catch (error) {
    console.error('Ошибка получения данных о воде:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 