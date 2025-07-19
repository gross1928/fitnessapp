import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { allergies, dislikes, likes, budget, cookingTime, mealsPerDay, dietaryRestrictions, goals } = body;

    const prompt = `
Создай персональный план питания на неделю для человека со следующими характеристиками:

Цель: ${goals}
Аллергии: ${allergies.join(', ') || 'Нет'}
Не любит: ${dislikes.join(', ') || 'Нет предпочтений'}
Любит: ${likes.join(', ') || 'Все'}
Бюджет: ${budget}
Время готовки: ${cookingTime}
Приемов пищи в день: ${mealsPerDay}
Диетические ограничения: ${dietaryRestrictions.join(', ') || 'Нет'}

Создай план в формате JSON со следующей структурой:
{
  "id": "unique_id",
  "goal": "описание цели",
  "dailyCalories": число,
  "meals": [
    {
      "day": 1-7,
      "meals": [
        {
          "type": "Завтрак/Обед/Ужин/Перекус",
          "name": "название блюда",
          "description": "краткое описание",
          "calories": число,
          "protein": число в граммах,
          "fats": число в граммах,
          "carbs": число в граммах,
          "ingredients": ["ингредиент1", "ингредиент2"],
          "instructions": ["шаг1", "шаг2"],
          "prepTime": число в минутах,
          "cost": "low/medium/high"
        }
      ]
    }
  ],
  "tips": ["совет1", "совет2"],
  "shoppingList": ["продукт1", "продукт2"]
}

Учти все предпочтения и ограничения. Сделай план разнообразным и вкусным.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Ты эксперт по питанию и диетологии. Создавай только валидный JSON без дополнительного текста."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('Не удалось получить ответ от ИИ');
    }

    // Пытаемся извлечь JSON из ответа
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Неверный формат ответа от ИИ');
    }

    const plan = JSON.parse(jsonMatch[0]);

    return NextResponse.json(plan);

  } catch (error) {
    console.error('Ошибка генерации плана питания:', error);
    return NextResponse.json(
      { error: 'Ошибка генерации плана питания' },
      { status: 500 }
    );
  }
} 