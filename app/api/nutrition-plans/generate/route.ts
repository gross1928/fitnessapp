import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { allergies, dislikes, likes, budget, cookingTime, mealsPerDay, dietaryRestrictions, goals } = body;

    // Рассчитываем калории на день в зависимости от цели
    let dailyCalories = 2500; // базовая норма
    if (goals === 'lose_weight') {
      dailyCalories = 2000; // дефицит калорий для похудения
    } else if (goals === 'gain_muscle') {
      dailyCalories = 3000; // профицит калорий для набора массы
    } else if (goals === 'maintain') {
      dailyCalories = 2500; // поддержание веса
    } else if (goals === 'improve_health') {
      dailyCalories = 2300; // здоровое питание
    }

    // Добавляем логирование для отладки
    console.log('🔍 Полученные предпочтения:', {
      mealsPerDay,
      goals,
      budget,
      cookingTime
    });

    // Определяем типы приемов пищи в зависимости от количества
    let mealTypes = ['Завтрак', 'Обед', 'Ужин'];
    let calorieDistribution = [0.3, 0.4, 0.3]; // Завтрак, Обед, Ужин
    
    if (mealsPerDay === 4) {
      mealTypes = ['Завтрак', 'Перекус', 'Обед', 'Ужин'];
      calorieDistribution = [0.25, 0.2, 0.35, 0.2]; // Завтрак, Перекус, Обед, Ужин
    } else if (mealsPerDay === 5) {
      mealTypes = ['Завтрак', 'Перекус', 'Обед', 'Полдник', 'Ужин'];
      calorieDistribution = [0.25, 0.15, 0.3, 0.15, 0.15]; // Завтрак, Перекус, Обед, Полдник, Ужин
    } else if (mealsPerDay === 6) {
      mealTypes = ['Завтрак', 'Перекус', 'Обед', 'Полдник', 'Ужин', 'Перекус'];
      calorieDistribution = [0.2, 0.15, 0.25, 0.15, 0.15, 0.1]; // Завтрак, Перекус, Обед, Полдник, Ужин, Перекус
    }

    console.log('🍽️ Типы приемов пищи:', mealTypes);
    console.log('📊 Распределение калорий:', calorieDistribution);

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
  "dailyCalories": ${dailyCalories},
  "meals": [
    {
      "day": 1,
      "meals": [
        {
          "type": "${mealTypes[0]}",
          "name": "название блюда",
          "description": "краткое описание",
          "calories": ${Math.round(dailyCalories * calorieDistribution[0])},
          "protein": число в граммах,
          "fats": число в граммах,
          "carbs": число в граммах,
          "ingredients": ["ингредиент1", "ингредиент2"],
          "instructions": ["шаг1", "шаг2"],
          "prepTime": число в минутах,
          "cost": "low/medium/high"
        },
        {
          "type": "${mealTypes[1]}",
          "name": "название блюда",
          "description": "краткое описание",
          "calories": ${Math.round(dailyCalories * calorieDistribution[1])},
          "protein": число в граммах,
          "fats": число в граммах,
          "carbs": число в граммах,
          "ingredients": ["ингредиент1", "ингредиент2"],
          "instructions": ["шаг1", "шаг2"],
          "prepTime": число в минутах,
          "cost": "low/medium/high"
        },
        {
          "type": "${mealTypes[2]}",
          "name": "название блюда",
          "description": "краткое описание",
          "calories": ${Math.round(dailyCalories * calorieDistribution[2])},
          "protein": число в граммах,
          "fats": число в граммах,
          "carbs": число в граммах,
          "ingredients": ["ингредиент1", "ингредиент2"],
          "instructions": ["шаг1", "шаг2"],
          "prepTime": число в минутах,
          "cost": "low/medium/high"
        }
        ${mealTypes.length > 3 ? `,
        {
          "type": "${mealTypes[3]}",
          "name": "название блюда",
          "description": "краткое описание",
          "calories": ${Math.round(dailyCalories * calorieDistribution[3])},
          "protein": число в граммах,
          "fats": число в граммах,
          "carbs": число в граммах,
          "ingredients": ["ингредиент1", "ингредиент2"],
          "instructions": ["шаг1", "шаг2"],
          "prepTime": число в минутах,
          "cost": "low/medium/high"
        }` : ''}
        ${mealTypes.length > 4 ? `,
        {
          "type": "${mealTypes[4]}",
          "name": "название блюда",
          "description": "краткое описание",
          "calories": ${Math.round(dailyCalories * calorieDistribution[4])},
          "protein": число в граммах,
          "fats": число в граммах,
          "carbs": число в граммах,
          "ingredients": ["ингредиент1", "ингредиент2"],
          "instructions": ["шаг1", "шаг2"],
          "prepTime": число в минутах,
          "cost": "low/medium/high"
        }` : ''}
        ${mealTypes.length > 5 ? `,
        {
          "type": "${mealTypes[5]}",
          "name": "название блюда",
          "description": "краткое описание",
          "calories": ${Math.round(dailyCalories * calorieDistribution[5])},
          "protein": число в граммах,
          "fats": число в граммах,
          "carbs": число в граммах,
          "ingredients": ["ингредиент1", "ингредиент2"],
          "instructions": ["шаг1", "шаг2"],
          "prepTime": число в минутах,
          "cost": "low/medium/high"
        }` : ''}
      ]
    }
    ${[2, 3, 4, 5, 6, 7].map(day => `,
    {
      "day": ${day},
      "meals": [
        {
          "type": "${mealTypes[0]}",
          "name": "название блюда",
          "description": "краткое описание",
          "calories": ${Math.round(dailyCalories * calorieDistribution[0])},
          "protein": число в граммах,
          "fats": число в граммах,
          "carbs": число в граммах,
          "ingredients": ["ингредиент1", "ингредиент2"],
          "instructions": ["шаг1", "шаг2"],
          "prepTime": число в минутах,
          "cost": "low/medium/high"
        },
        {
          "type": "${mealTypes[1]}",
          "name": "название блюда",
          "description": "краткое описание",
          "calories": ${Math.round(dailyCalories * calorieDistribution[1])},
          "protein": число в граммах,
          "fats": число в граммах,
          "carbs": число в граммах,
          "ingredients": ["ингредиент1", "ингредиент2"],
          "instructions": ["шаг1", "шаг2"],
          "prepTime": число в минутах,
          "cost": "low/medium/high"
        },
        {
          "type": "${mealTypes[2]}",
          "name": "название блюда",
          "description": "краткое описание",
          "calories": ${Math.round(dailyCalories * calorieDistribution[2])},
          "protein": число в граммах,
          "fats": число в граммах,
          "carbs": число в граммах,
          "ingredients": ["ингредиент1", "ингредиент2"],
          "instructions": ["шаг1", "шаг2"],
          "prepTime": число в минутах,
          "cost": "low/medium/high"
        }
        ${mealTypes.length > 3 ? `,
        {
          "type": "${mealTypes[3]}",
          "name": "название блюда",
          "description": "краткое описание",
          "calories": ${Math.round(dailyCalories * calorieDistribution[3])},
          "protein": число в граммах,
          "fats": число в граммах,
          "carbs": число в граммах,
          "ingredients": ["ингредиент1", "ингредиент2"],
          "instructions": ["шаг1", "шаг2"],
          "prepTime": число в минутах,
          "cost": "low/medium/high"
        }` : ''}
        ${mealTypes.length > 4 ? `,
        {
          "type": "${mealTypes[4]}",
          "name": "название блюда",
          "description": "краткое описание",
          "calories": ${Math.round(dailyCalories * calorieDistribution[4])},
          "protein": число в граммах,
          "fats": число в граммах,
          "carbs": число в граммах,
          "ingredients": ["ингредиент1", "ингредиент2"],
          "instructions": ["шаг1", "шаг2"],
          "prepTime": число в минутах,
          "cost": "low/medium/high"
        }` : ''}
        ${mealTypes.length > 5 ? `,
        {
          "type": "${mealTypes[5]}",
          "name": "название блюда",
          "description": "краткое описание",
          "calories": ${Math.round(dailyCalories * calorieDistribution[5])},
          "protein": число в граммах,
          "fats": число в граммах,
          "carbs": число в граммах,
          "ingredients": ["ингредиент1", "ингредиент2"],
          "instructions": ["шаг1", "шаг2"],
          "prepTime": число в минутах,
          "cost": "low/medium/high"
        }` : ''}
      ]
    }`).join('')}
  ],
  "shoppingList": ["продукт1", "продукт2"]
}

ВАЖНО: 
1. Создай план питания для ВСЕХ 7 дней недели (дни 1-7). Не пропускай дни!
2. Общая калорийность в день должна быть ${dailyCalories} ккал
3. Создай ${mealsPerDay} приемов пищи в день: ${mealTypes.join(', ')}
4. Распредели калории между приемами пищи пропорционально
5. Учти все предпочтения и ограничения. Сделай план разнообразным и вкусным.
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