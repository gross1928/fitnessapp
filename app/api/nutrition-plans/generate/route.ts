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
Создай план питания на один день для человека со следующими характеристиками:

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
    }
    ${mealTypes.length > 1 ? `,
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
    }` : ''}
    ${mealTypes.length > 2 ? `,
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
    }` : ''}
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
  ],
  "tips": ["совет1", "совет2", "совет3"],
  "shoppingList": ["продукт1", "продукт2", "продукт3"]
}

Важно: создай только план на один день, не на неделю.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Ты эксперт по питанию и диетологии. Создавай простые, вкусные и полезные планы питания."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('Пустой ответ от OpenAI');
    }

    // Извлекаем JSON из ответа
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Не удалось найти JSON в ответе');
    }

    const planData = JSON.parse(jsonMatch[0]);
    
    console.log('✅ План успешно сгенерирован:', planData);

    return NextResponse.json(planData);

  } catch (error) {
    console.error('❌ Ошибка генерации плана питания:', error);
    
    // Возвращаем демо-план в случае ошибки
    return NextResponse.json({
      id: 'demo',
      goal: 'Поддержание веса',
      dailyCalories: 2500,
      meals: [
        {
          type: 'Завтрак',
          name: 'Овсянка с ягодами',
          description: 'Питательная овсянка с свежими ягодами и орехами',
          calories: 350,
          protein: 12,
          fats: 8,
          carbs: 55,
          ingredients: ['Овсянка', 'Ягоды', 'Орехи', 'Мед'],
          instructions: ['Сварить овсянку', 'Добавить ягоды и орехи', 'Полить медом'],
          prepTime: 10,
          cost: 'low'
        },
        {
          type: 'Обед',
          name: 'Куриная грудка с овощами',
          description: 'Запеченная куриная грудка с тушеными овощами',
          calories: 450,
          protein: 35,
          fats: 15,
          carbs: 25,
          ingredients: ['Куриная грудка', 'Брокколи', 'Морковь', 'Оливковое масло'],
          instructions: ['Запечь курицу', 'Потушить овощи', 'Подать вместе'],
          prepTime: 25,
          cost: 'medium'
        },
        {
          type: 'Ужин',
          name: 'Лосось с рисом',
          description: 'Запеченный лосось с бурым рисом',
          calories: 400,
          protein: 30,
          fats: 20,
          carbs: 30,
          ingredients: ['Лосось', 'Бурый рис', 'Лимон', 'Травы'],
          instructions: ['Запечь лосось', 'Сварить рис', 'Добавить лимон'],
          prepTime: 20,
          cost: 'high'
        }
      ],
      tips: ['Пейте больше воды', 'Ешьте медленно', 'Не пропускайте приемы пищи'],
      shoppingList: ['Овсянка', 'Ягоды', 'Орехи', 'Мед', 'Куриная грудка', 'Брокколи', 'Морковь', 'Лосось', 'Бурый рис']
    });
  }
} 