import { NextRequest, NextResponse } from 'next/server'
import { analyzeFoodText } from '@/lib/openai'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { foodDescription } = await request.json()
    
    if (!foodDescription || typeof foodDescription !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Описание еды не предоставлено' },
        { status: 400 }
      )
    }

    if (foodDescription.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Описание слишком короткое' },
        { status: 400 }
      )
    }

    if (foodDescription.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Описание слишком длинное (максимум 1000 символов)' },
        { status: 400 }
      )
    }

    // Анализируем текстовое описание с помощью OpenAI
    const analysis = await analyzeFoodText(foodDescription)

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
        try {
          // Создаем или находим продукт в базе
          let foodItemId: string
          
          const { data: existingFood } = await supabase
            .from('food_items')
            .select('id')
            .eq('name', analysis.detected_food)
            .eq('user_id', user.id)
            .single()

          if (existingFood) {
            foodItemId = existingFood.id
          } else {
            // Создаем новый продукт
            const { data: newFood, error: foodError } = await supabase
              .from('food_items')
              .insert({
                user_id: user.id,
                name: analysis.detected_food,
                calories_per_100g: analysis.estimated_calories,
                proteins_per_100g: analysis.estimated_nutrition.proteins,
                fats_per_100g: analysis.estimated_nutrition.fats,
                carbs_per_100g: analysis.estimated_nutrition.carbs
              })
              .select('id')
              .single()

            if (foodError || !newFood) {
              console.error('Ошибка создания продукта:', foodError)
            } else {
              foodItemId = newFood.id
              
              // Создаем запись о приеме пищи (предполагаем 100г)
              const amount = 100 // грамм
              await supabase
                .from('meal_entries')
                .insert({
                  user_id: user.id,
                  food_item_id: foodItemId,
                  meal_type: 'snack', // по умолчанию перекус
                  amount: amount,
                  calories: Math.round(analysis.estimated_calories * amount / 100),
                  proteins: Math.round(analysis.estimated_nutrition.proteins * amount / 100),
                  fats: Math.round(analysis.estimated_nutrition.fats * amount / 100),
                  carbs: Math.round(analysis.estimated_nutrition.carbs * amount / 100),
                  notes: `Анализ AI: ${foodDescription}`
                })
            }
          }
        } catch (dbError) {
          console.error('Ошибка работы с базой данных:', dbError)
          // Продолжаем выполнение, не блокируем анализ
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        originalDescription: foodDescription,
        suggestions: [
          'Рекомендуется указать точный вес порции для более точного расчета',
          'Уточните способ приготовления, если это влияет на калорийность',
          ...analysis.health_notes || []
        ]
      },
      message: 'Анализ описания завершен'
    })

  } catch (error) {
    console.error('Ошибка анализа текста еды:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message.includes('OpenAI') 
            ? 'Ошибка AI-анализа. Попробуйте позже.'
            : 'Не удалось проанализировать описание еды'
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