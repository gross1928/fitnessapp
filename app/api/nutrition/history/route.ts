import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

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

    // Получаем записи о еде за сегодня
    const { data: mealEntries, error } = await supabase
      .from('meal_entries')
      .select(`
        id,
        food_items (name),
        meal_type,
        amount,
        calories,
        proteins,
        fats,
        carbs,
        created_at
      `)
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Ошибка получения истории еды:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения данных' },
        { status: 500 }
      )
    }

    // Форматируем данные для фронтенда
    const formattedEntries = (mealEntries || []).map((entry: any) => ({
      id: entry.id,
      name: entry.food_items?.name || 'Неизвестный продукт',
      time: new Date(entry.created_at).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      calories: Math.round(entry.calories),
      protein: Math.round(entry.proteins),
      fat: Math.round(entry.fats),
      carbs: Math.round(entry.carbs)
    }))

    return NextResponse.json({
      success: true,
      data: {
        date: today,
        entries: formattedEntries,
        totalCalories: formattedEntries.reduce((sum: number, entry: any) => sum + entry.calories, 0),
        totalProteins: formattedEntries.reduce((sum: number, entry: any) => sum + entry.protein, 0),
        totalFats: formattedEntries.reduce((sum: number, entry: any) => sum + entry.fat, 0),
        totalCarbs: formattedEntries.reduce((sum: number, entry: any) => sum + entry.carbs, 0)
      }
    })

  } catch (error) {
    console.error('Ошибка API истории еды:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 