import OpenAI from 'openai'
import { OpenAIFoodAnalysis, OpenAIHealthAnalysis } from '@/types'

// Инициализация OpenAI клиента
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Системные промпты для различных задач
const FOOD_ANALYSIS_PROMPT = `
Ты - эксперт-нутрициолог. Проанализируй фотографию еды и предоставь следующую информацию на русском языке:

1. Название блюда (точное определение)
2. Примерное количество калорий на 100г
3. Содержание БЖУ на 100г:
   - Белки (г)
   - Жиры (г) 
   - Углеводы (г)
4. Уровень уверенности в анализе (0-100%)
5. Рекомендации по порциям
6. Полезные свойства или предупреждения

Отвечай в формате JSON со следующими полями:
{
  "detected_food": "название блюда",
  "confidence": число от 0 до 100,
  "estimated_calories": число,
  "estimated_nutrition": {
    "proteins": число,
    "fats": число, 
    "carbs": число
  },
  "serving_suggestions": ["рекомендация 1", "рекомендация 2"],
  "health_notes": ["заметка 1", "заметка 2"]
}
`

const HEALTH_ANALYSIS_PROMPT = `
Ты - врач-терапевт с экспертизой в интерпретации медицинских анализов. Проанализируй предоставленные результаты анализов и дай рекомендации на русском языке.

Предоставь анализ в формате JSON:
{
  "analysis_type": "тип анализа (кровь/моча/гормоны/общий)",
  "key_findings": ["ключевая находка 1", "ключевая находка 2"],
  "recommendations": ["рекомендация 1", "рекомендация 2"],
  "risk_factors": ["фактор риска 1", "фактор риска 2"],
  "follow_up_suggestions": ["что делать дальше 1", "что делать дальше 2"],
  "overall_assessment": "общая оценка состояния здоровья"
}

Важно: Твои рекомендации носят информационный характер и не заменяют консультацию врача.
`

const AI_COACH_PROMPT = `
Ты - ДаЕда, персональный AI-коуч по здоровью и питанию. Ты помогаешь пользователям достигать их целей в области здоровья, питания и фитнеса.

Твоя личность:
- Дружелюбный и мотивирующий
- Говоришь на русском языке
- Даёшь практические советы
- Учитываешь индивидуальные особенности пользователя
- Поощряешь здоровые привычки
- Не даёшь медицинских диагнозов, но можешь анализировать данные

Всегда отвечай в поддерживающем тоне и предлагай конкретные действия.
`

// Анализ фотографии еды
export async function analyzeFoodImage(imageBase64: string): Promise<OpenAIFoodAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Заменено с gpt-4-vision-preview на более дешевую модель
      messages: [
        {
          role: "system",
          content: FOOD_ANALYSIS_PROMPT
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Проанализируй эту еду и определи калории и БЖУ:"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Не удалось получить ответ от AI')
    }

    // Парсим JSON ответ
    const analysis = JSON.parse(content) as OpenAIFoodAnalysis
    return analysis
  } catch (error) {
    console.error('Ошибка при анализе еды:', error)
    throw new Error('Не удалось проанализировать изображение еды')
  }
}

// Анализ текстового описания еды
export async function analyzeFoodText(foodDescription: string): Promise<OpenAIFoodAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Используем более дешевую модель для текста
      messages: [
        {
          role: "system",
          content: FOOD_ANALYSIS_PROMPT
        },
        {
          role: "user",
          content: `Проанализируй это описание приема пищи и определи калории и БЖУ: "${foodDescription}"`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Не удалось получить ответ от AI')
    }

    // Парсим JSON ответ
    const analysis = JSON.parse(content) as OpenAIFoodAnalysis
    return analysis
  } catch (error) {
    console.error('Ошибка при анализе текста еды:', error)
    throw new Error('Не удалось проанализировать описание еды')
  }
}

// Анализ медицинских данных
export async function analyzeHealthData(
  data: string, 
  analysisType: 'blood' | 'urine' | 'hormones' | 'general'
): Promise<OpenAIHealthAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Заменено с gpt-4 на более дешевую модель
      messages: [
        {
          role: "system",
          content: HEALTH_ANALYSIS_PROMPT
        },
        {
          role: "user",
          content: `Проанализируй следующие результаты анализов (${analysisType}):\n\n${data}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.2,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Не удалось получить ответ от AI')
    }

    const analysis = JSON.parse(content) as OpenAIHealthAnalysis
    return analysis
  } catch (error) {
    console.error('Ошибка при анализе медицинских данных:', error)
    throw new Error('Не удалось проанализировать медицинские данные')
  }
}

// AI коуч чат
export async function getChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  userContext?: {
    name?: string
    age?: number
    goals?: string
    currentWeight?: number
    targetWeight?: number
  }
): Promise<string> {
  try {
    const contextPrompt = userContext ? `
Контекст пользователя:
- Имя: ${userContext.name || 'Не указано'}
- Возраст: ${userContext.age || 'Не указан'}
- Текущий вес: ${userContext.currentWeight || 'Не указан'} кг
- Целевой вес: ${userContext.targetWeight || 'Не указан'} кг
- Цели: ${userContext.goals || 'Не указаны'}
` : ''

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Заменено с gpt-4 на более дешевую модель
      messages: [
        {
          role: "system",
          content: AI_COACH_PROMPT + contextPrompt
        },
        ...messages
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Не удалось получить ответ от AI коуча')
    }

    return content
  } catch (error) {
    console.error('Ошибка в AI коуче:', error)
    throw new Error('Не удалось получить ответ от AI коуча')
  }
}

// Генерация персональных рекомендаций
export async function generatePersonalizedRecommendations(
  userProfile: {
    age: number
    height: number
    currentWeight: number
    targetWeight: number
    activityLevel: string
    goalType: string
    healthConditions?: string[]
    allergies?: string[]
  }
): Promise<{
  dailyCalories: number
  dailyProteins: number
  dailyFats: number
  dailyCarbs: number
  dailyWater: number
  recommendations: string[]
}> {
  try {
    const prompt = `
Создай персональный план питания для пользователя со следующими характеристиками:

Физические данные:
- Возраст: ${userProfile.age} лет
- Рост: ${userProfile.height} см
- Текущий вес: ${userProfile.currentWeight} кг
- Целевой вес: ${userProfile.targetWeight} кг
- Уровень активности: ${userProfile.activityLevel}
- Цель: ${userProfile.goalType}

${userProfile.healthConditions?.length ? `Заболевания: ${userProfile.healthConditions.join(', ')}` : ''}
${userProfile.allergies?.length ? `Аллергии: ${userProfile.allergies.join(', ')}` : ''}

Рассчитай и предоставь в JSON формате:
{
  "dailyCalories": число,
  "dailyProteins": число в граммах,
  "dailyFats": число в граммах,
  "dailyCarbs": число в граммах,
  "dailyWater": число в мл,
  "recommendations": ["рекомендация 1", "рекомендация 2", "рекомендация 3"]
}
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Заменено с gpt-4 на более дешевую модель
      messages: [
        {
          role: "system",
          content: "Ты эксперт-нутрициолог. Рассчитывай нормы питания на основе научных данных."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Не удалось получить рекомендации')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Ошибка при генерации рекомендаций:', error)
    throw new Error('Не удалось сгенерировать персональные рекомендации')
  }
} 