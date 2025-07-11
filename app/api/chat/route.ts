import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'
import { getChatResponse, analyzeFoodImage, analyzeHealthData } from '@/lib/openai'

// GET - получить историю чата
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
      .select('*')
      .eq('telegram_id', parseInt(telegramId))
      .single()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Получаем последние 50 сообщений
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50)

    if (error) {
      console.error('Ошибка загрузки сообщений:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка загрузки сообщений' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        messages: messages || [],
        user: {
          name: user.name,
          age: user.age,
          goals: user.goal_type,
          currentWeight: user.current_weight,
          targetWeight: user.target_weight
        }
      }
    })

  } catch (error) {
    console.error('Ошибка API чата (GET):', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// POST - отправить новое сообщение
export async function POST(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-user-id')
    
    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'Требуется авторизация' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const content = formData.get('content') as string
    const messageType = formData.get('message_type') as string || 'text'
    const file = formData.get('file') as File | null

    if (!content && !file) {
      return NextResponse.json(
        { success: false, error: 'Сообщение или файл обязательны' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()
    
    // Получаем пользователя
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', parseInt(telegramId))
      .single()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Сохраняем сообщение пользователя
    const userMessageData = {
      user_id: user.id,
      role: 'user' as const,
      content: content || 'Загружен файл',
      message_type: messageType,
      metadata: file ? { 
        file_name: file.name, 
        file_type: file.type,
        file_size: file.size 
      } : null
    }

    const { data: userMessage, error: userMessageError } = await supabase
      .from('chat_messages')
      .insert(userMessageData)
      .select()
      .single()

    if (userMessageError) {
      console.error('Ошибка сохранения сообщения пользователя:', userMessageError)
      return NextResponse.json(
        { success: false, error: 'Ошибка сохранения сообщения' },
        { status: 500 }
      )
    }

    // Обрабатываем файл и генерируем ответ ИИ
    let aiResponse = ''
    let metadata: any = null

    try {
      if (file) {
        if (file.type.startsWith('image/')) {
          // Анализ изображения еды
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const base64Image = buffer.toString('base64')
          
          const foodAnalysis = await analyzeFoodImage(base64Image)
          
          aiResponse = `🍎 **Анализ изображения завершен!**

**Определено:** ${foodAnalysis.detected_food}
**Уверенность:** ${foodAnalysis.confidence}%

**Пищевая ценность на 100г:**
• Калории: ${foodAnalysis.estimated_calories} ккал
• Белки: ${foodAnalysis.estimated_nutrition.proteins}г
• Жиры: ${foodAnalysis.estimated_nutrition.fats}г
• Углеводы: ${foodAnalysis.estimated_nutrition.carbs}г

**Рекомендации по порциям:**
${foodAnalysis.serving_suggestions?.map(s => `• ${s}`).join('\n') || '• Рекомендуется взвешивание для точности'}

**Полезные советы:**
${foodAnalysis.health_notes?.map(n => `• ${n}`).join('\n') || '• Включите это блюдо в сбалансированный рацион'}`

          metadata = { food_analysis: foodAnalysis }
          
        } else {
          // Анализ документа/файла
          const text = await file.text()
          
          let analysisType: 'blood' | 'urine' | 'hormones' | 'general' = 'general'
          
          // Определяем тип анализа по содержимому
          const lowerText = text.toLowerCase()
          if (lowerText.includes('гемоглобин') || lowerText.includes('эритроциты') || lowerText.includes('лейкоциты')) {
            analysisType = 'blood'
          } else if (lowerText.includes('белок') && lowerText.includes('моча')) {
            analysisType = 'urine'
          } else if (lowerText.includes('тестостерон') || lowerText.includes('эстроген') || lowerText.includes('кортизол')) {
            analysisType = 'hormones'
          }
          
          const healthAnalysis = await analyzeHealthData(text, analysisType)
          
          aiResponse = `📋 **Анализ медицинских данных завершен!**

**Тип анализа:** ${healthAnalysis.analysis_type}

**Ключевые находки:**
${healthAnalysis.key_findings.map(f => `• ${f}`).join('\n')}

**Рекомендации:**
${healthAnalysis.recommendations.map(r => `• ${r}`).join('\n')}

**Общая оценка:**
${healthAnalysis.overall_assessment}

**Что делать дальше:**
${healthAnalysis.follow_up_suggestions?.map(s => `• ${s}`).join('\n') || '• Регулярно отслеживайте показатели здоровья'}

⚠️ *Важно: Данные рекомендации носят информационный характер и не заменяют консультацию врача.*`

          metadata = { health_analysis: healthAnalysis }
        }
      } else {
        // Обычный текстовый чат
        // Получаем историю сообщений для контекста
        const { data: recentMessages } = await supabase
          .from('chat_messages')
          .select('role, content')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(20)

        const chatHistory = (recentMessages || []).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))

        // Добавляем текущее сообщение в историю
        chatHistory.push({ role: 'user', content })

        // Собираем ПОЛНЫЙ контекст пользователя
        const today = new Date().toISOString().split('T')[0]
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        // Питание за сегодня
        const { data: todayMeals } = await supabase
          .from('meal_entries')
          .select(`
            meal_type,
            amount,
            calories,
            proteins,
            fats,
            carbs,
            created_at,
            food_items!inner(name)
          `)
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`)

        // Вода за сегодня
        const { data: todayWater } = await supabase
          .from('water_entries')
          .select('amount')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`)

        // Недавние анализы здоровья
        const { data: recentAnalyses } = await supabase
          .from('health_analyses')
          .select('analysis_type, key_findings, recommendations, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)

        // Записи веса за последнюю неделю
        const { data: recentWeight } = await supabase
          .from('weight_entries')
          .select('weight, created_at')
          .eq('user_id', user.id)
          .gte('created_at', `${weekAgo}T00:00:00.000Z`)
          .order('created_at', { ascending: false })
          .limit(5)

        // Подсчитываем дневные показатели
        const todayTotalCalories = (todayMeals || []).reduce((sum, meal) => sum + meal.calories, 0)
        const todayTotalProteins = (todayMeals || []).reduce((sum, meal) => sum + meal.proteins, 0)
        const todayTotalFats = (todayMeals || []).reduce((sum, meal) => sum + meal.fats, 0)
        const todayTotalCarbs = (todayMeals || []).reduce((sum, meal) => sum + meal.carbs, 0)
        const todayTotalWater = (todayWater || []).reduce((sum, entry) => sum + entry.amount, 0)

        const fullUserContext = {
          // Базовая информация
          name: user.name,
          age: user.age,
          height: user.height,
          goals: user.goal_type,
          currentWeight: user.current_weight,
          targetWeight: user.target_weight,
          activityLevel: user.activity_level,
          
          // Цели по питанию
          dailyCalorieTarget: user.daily_calorie_target,
          dailyProteinTarget: user.daily_protein_target,
          dailyFatTarget: user.daily_fat_target,
          dailyCarbTarget: user.daily_carb_target,
          dailyWaterTarget: user.daily_water_target,
          
          // Показатели за сегодня
          todayNutrition: {
            calories: todayTotalCalories,
            proteins: Math.round(todayTotalProteins * 10) / 10,
            fats: Math.round(todayTotalFats * 10) / 10,
            carbs: Math.round(todayTotalCarbs * 10) / 10,
            water: todayTotalWater,
            mealsCount: (todayMeals || []).length
          },
          
          // Что ел сегодня
          todayMeals: (todayMeals || []).map(meal => ({
            food: (meal as any).food_items?.name || 'Неизвестно',
            mealType: meal.meal_type,
            amount: meal.amount,
            calories: meal.calories,
            time: new Date(meal.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
          })),
          
          // Недавние анализы
          recentHealthAnalyses: (recentAnalyses || []).map(analysis => ({
            type: analysis.analysis_type,
            keyFindings: analysis.key_findings?.slice(0, 2) || [], // только ключевые находки
            date: new Date(analysis.created_at).toLocaleDateString('ru-RU')
          })),
          
          // Изменения веса
          weightProgress: (recentWeight || []).map(entry => ({
            weight: entry.weight,
            date: new Date(entry.created_at).toLocaleDateString('ru-RU')
          }))
        }

        aiResponse = await getChatResponse(chatHistory, fullUserContext)
      }
    } catch (error) {
      console.error('Ошибка обработки ИИ:', error)
      aiResponse = 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз или обратитесь за поддержкой.'
    }

    // Сохраняем ответ ассистента
    const assistantMessageData = {
      user_id: user.id,
      role: 'assistant' as const,
      content: aiResponse,
      message_type: 'text',
      metadata
    }

    const { data: assistantMessage, error: assistantMessageError } = await supabase
      .from('chat_messages')
      .insert(assistantMessageData)
      .select()
      .single()

    if (assistantMessageError) {
      console.error('Ошибка сохранения ответа ассистента:', assistantMessageError)
      // Не возвращаем ошибку, так как пользователь уже отправил сообщение
    }

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse,
        metadata,
        user_message_id: userMessage.id,
        assistant_message_id: assistantMessage?.id
      }
    })

  } catch (error) {
    console.error('Ошибка API чата (POST):', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 