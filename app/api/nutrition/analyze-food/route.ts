import { NextRequest, NextResponse } from 'next/server'
import { analyzeFoodImage } from '@/lib/openai'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'Изображение не предоставлено' },
        { status: 400 }
      )
    }

    // Конвертируем изображение в base64
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Анализируем изображение с помощью OpenAI
    const analysis = await analyzeFoodImage(base64Image)

    // Опционально: сохраняем результат в базу данных
    const telegramId = request.headers.get('x-telegram-user-id')
    
    if (telegramId) {
      const supabase = createServerClient()
      
      // Получаем пользователя
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', parseInt(telegramId))
        .single()

      if (user) {
        // Создаем или находим продукт в базе
        const { data: existingFood } = await supabase
          .from('food_items')
          .select('id')
          .eq('name', analysis.detected_food)
          .eq('user_id', user.id)
          .single()

        if (!existingFood) {
          // Создаем новый продукт
          await supabase
            .from('food_items')
            .insert({
              user_id: user.id,
              name: analysis.detected_food,
              calories_per_100g: analysis.estimated_calories,
              proteins_per_100g: analysis.estimated_nutrition.proteins,
              fats_per_100g: analysis.estimated_nutrition.fats,
              carbs_per_100g: analysis.estimated_nutrition.carbs
            })
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        suggestions: [
          'Рекомендуется указать точный вес порции для более точного расчета',
          'Проверьте состав блюда, если есть скрытые ингредиенты',
          ...analysis.health_notes || []
        ]
      },
      message: 'Анализ изображения завершен'
    })

  } catch (error) {
    console.error('Ошибка анализа еды:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message.includes('OpenAI') 
            ? 'Ошибка AI-анализа. Попробуйте позже.'
            : 'Не удалось проанализировать изображение'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// Опциональный GET endpoint для получения истории анализов
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const telegramId = request.headers.get('x-telegram-user-id')
    
    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'Требуется авторизация' },
        { status: 401 }
      )
    }

    // Получаем последние анализы пользователя
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

    const { data: analyses, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Ошибка получения анализов:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения данных' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: analyses
    })

  } catch (error) {
    console.error('Ошибка API анализов:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 