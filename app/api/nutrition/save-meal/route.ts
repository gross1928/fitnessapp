import { createServiceRoleClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const { 
      food_name, 
      calories, 
      proteins, 
      fats, 
      carbs, 
      amount, 
      raw_analysis 
    } = await req.json()
    const telegramUserId = req.headers.get('x-telegram-user-id')

    if (!telegramUserId) {
      return NextResponse.json({ success: false, error: 'Telegram user ID is required' }, { status: 400 })
    }

    // 1. Найти пользователя по Telegram ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', parseInt(telegramUserId, 10))
      .single()

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Рассчитываем КБЖУ на 100г
    const ratio = 100 / (amount || 100);

    // 2. Найти или создать запись в food_items
    const { data: foodItem, error: foodItemError } = await supabase
      .from('food_items')
      .upsert(
        { 
          name: food_name,
          calories_per_100g: calories * ratio,
          proteins_per_100g: proteins * ratio,
          fats_per_100g: fats * ratio,
          carbs_per_100g: carbs * ratio,
          user_id: user.id // Указываем, кто добавил продукт
        },
        { onConflict: 'name, user_id', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (foodItemError || !foodItem) {
        console.error('Database upsert error in food_items:', foodItemError);
        throw new Error(`Database upsert error in food_items: ${foodItemError?.message}`)
    }


    // 3. Сохранить основную запись о приеме пищи
    const { data: mealEntry, error: insertError } = await supabase
      .from('meal_entries')
      .insert({
        user_id: user.id,
        meal_type: 'snack', // Можно сделать это поле настраиваемым в будущем
        food_item_id: foodItem.id, // Используем ID из food_items
        calories: calories,
        proteins: proteins,
        fats: fats,
        carbs: carbs,
        amount: amount,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Database insert error in meal_entries:', insertError);
      throw new Error(`Database insert error: ${insertError.message}`)
    }
    
    // 4. Сохранить детальный анализ
    const { error: analysisInsertError } = await supabase
      .from('food_analysis')
      .insert({
        meal_entry_id: mealEntry.id,
        user_id: user.id,
        analysis_provider: 'openai',
        raw_response: raw_analysis, // Сохраняем полный JSON ответа
        confidence_score: raw_analysis.confidence ?? null // Используем confidence, если есть
      })

    if (analysisInsertError) {
      // Это не критичная ошибка, поэтому просто логируем ее
      console.error('Failed to save food analysis details:', analysisInsertError)
    }

    return NextResponse.json({ success: true, data: { meal_entry_id: mealEntry.id } })

  } catch (error) {
    console.error('[Save Meal API Error]', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
} 