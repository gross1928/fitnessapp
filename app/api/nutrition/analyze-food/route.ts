import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { Database } from '@/types/database'

// Тип для анализа от OpenAI
type FoodAnalysis = Database['public']['Tables']['food_analysis']['Row'] & {
  detected_food: string
  estimated_calories: number
  estimated_nutrition: {
    proteins: number
    fats: number
    carbs: number
  }
  confidence: number
  error?: string
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
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
    
    const buffer = Buffer.from(await foodPhoto.arrayBuffer())
    const base64Image = buffer.toString('base64')

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Что на этом фото? Оцени калорийность, БЖУ на 100г. Ответ дай в формате JSON: {detected_food: string, estimated_calories: number, estimated_nutrition: {proteins: number, fats: number, carbs: number}, confidence: number (0-100)}." },
            {
              type: "image_url",
              image_url: {
                "url": `data:image/jpeg;base64,${base64Image}`
              }
            },
          ],
        },
      ],
      max_tokens: 300,
    });
    
    const analysisResult = response.choices[0].message.content
    if (!analysisResult) {
      throw new Error('OpenAI returned no content')
    }
    
    let analysisJson: FoodAnalysis
    try {
      analysisJson = JSON.parse(analysisResult)
    } catch (e) {
      throw new Error('Failed to parse analysis from OpenAI')
    }

    if(analysisJson.error) {
        throw new Error(`OpenAI error: ${analysisJson.error}`)
    }

    // Сохранение в базу данных
    const { data: mealEntry, error: insertError } = await supabase
      .from('meal_entries')
      .insert({
        user_id: user.id,
        meal_type: 'snack', // По умолчанию, можно дать пользователю выбор
        food_name: analysisJson.detected_food, // Добавляем поле food_name, если его нет
        calories: analysisJson.estimated_calories,
        protein: analysisJson.estimated_nutrition.proteins,
        fat: analysisJson.estimated_nutrition.fats,
        carbs: analysisJson.estimated_nutrition.carbs,
        amount: 100, // Предполагаем 100г для анализа
      })
      .select()
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
        raw_response: analysisJson,
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