import { createServiceRoleClient } from '@/lib/supabase' // Используем сервисный клиент
import { NextRequest, NextResponse } from 'next/server'
import { analyzeFoodImage } from '@/lib/openai' // Импортируем нашу функцию
import { Database } from '@/types/database'

type FoodAnalysis = ReturnType<typeof analyzeFoodImage> extends Promise<infer T> ? T : never;


export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient() // Заменяем на сервисный клиент
    const formData = await req.formData()
    const foodPhoto = formData.get('food_photo') as File | null
    const telegramUserId = req.headers.get('x-telegram-user-id')

    if (!telegramUserId) {
      return NextResponse.json({ success: false, error: 'Telegram user ID is required' }, { status: 400 })
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', parseInt(telegramUserId, 10))
      .single()

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }
    
    if (!foodPhoto) {
      return NextResponse.json({ success: false, error: 'No photo provided' }, { status: 400 })
    }
    
    // Используем стабильный API вместо экспериментального arrayBuffer()
    const stream = foodPhoto.stream()
    const chunks: Uint8Array[] = []
    const reader = stream.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
    } finally {
      reader.releaseLock()
    }

    // Объединяем chunks в один buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const uint8Array = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      uint8Array.set(chunk, offset)
      offset += chunk.length
    }

    const buffer = Buffer.from(uint8Array)
    const base64Image = buffer.toString('base64')

    // Используем централизованную функцию
    const analysisJson = await analyzeFoodImage(base64Image)
    
    // Сохранение в базу данных
    const { data: mealEntry, error: insertError } = await supabase
      .from('meal_entries')
      .insert({
        user_id: user.id,
        meal_type: 'snack', // По умолчанию, можно дать пользователю выбор
        food_name: analysisJson.detected_food,
        calories: analysisJson.estimated_calories,
        proteins: analysisJson.estimated_nutrition.proteins, // исправлено fat на proteins
        fats: analysisJson.estimated_nutrition.fats,     // исправлено carbs на fats
        carbs: analysisJson.estimated_nutrition.carbs,     // исправлено amount на carbs
        amount: 100, // Предполагаем 100г для анализа
      })
      .select('id')
      .single()

    if (insertError) {
      throw new Error(`Database insert error: ${insertError.message}`)
    }
    
    const { error: analysisInsertError } = await supabase
      .from('food_analysis')
      .insert({
        meal_entry_id: mealEntry.id,
        user_id: user.id,
        image_url: null, // В будущем можно сохранять ссылку на фото в storage
        analysis_provider: 'openai',
        raw_response: analysisJson as any, // Приводим тип, так как в базе он Json
        confidence_score: analysisJson.confidence
      })

    if (analysisInsertError) {
      // Можно откатить транзакцию, но пока просто логируем
      console.error('Failed to save analysis details:', analysisInsertError)
    }

    return NextResponse.json({ success: true, data: { analysis: analysisJson } })

  } catch (error) {
    console.error('[Analyze Food API Error]', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
} 