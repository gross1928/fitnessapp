import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json()
    const telegramId = request.headers.get('x-telegram-user-id')
    
    console.log('💧 Water API - received request:', { amount, telegramId })
    
    if (!telegramId) {
      console.log('❌ No telegram ID provided')
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

    const supabase = createServiceRoleClient()
    
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

    // Получаем все записи за сегодня
    const { data: todayEntries } = await supabase
      .from('water_entries')
      .select('amount')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)

    // Вычисляем текущий объем за сегодня
    const currentTotal = (todayEntries || []).reduce((sum: number, entry: any) => sum + entry.amount, 0)

    // Создаем новую запись
    const { data: newEntry, error } = await supabase
      .from('water_entries')
      .insert({
        user_id: user.id,
        amount: amount
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

    // Новый общий объем
    const newTotal = currentTotal + amount

    return NextResponse.json({
      success: true,
      data: {
        totalToday: newTotal,
        addedAmount: amount,
        date: today
      },
      message: `Добавлено ${amount}мл воды`
    })

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

    const supabase = createServiceRoleClient()
    
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

    // Получаем все записи за сегодня
    const { data: todayEntries } = await supabase
      .from('water_entries')
      .select('amount')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)

    // Суммируем все записи за день
    const totalToday = (todayEntries || []).reduce((sum: number, entry: any) => sum + entry.amount, 0)

    return NextResponse.json({
      success: true,
      data: {
        totalToday: totalToday,
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