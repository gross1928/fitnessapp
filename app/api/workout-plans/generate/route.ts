import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goals, experience, availableDays, sessionDuration, equipment, injuries, fitnessLevel, preferredExercises } = body;

    const prompt = `
Создай план тренировки на один день для человека со следующими характеристиками:

Цель: ${goals}
Опыт: ${experience}
Длительность сессии: ${sessionDuration}
Оборудование: ${equipment.join(', ') || 'Только вес тела'}
Травмы/ограничения: ${injuries.join(', ') || 'Нет'}
Уровень подготовки: ${fitnessLevel}/10
Предпочитаемые упражнения: ${preferredExercises.join(', ') || 'Любые'}

Создай план в формате JSON со следующей структурой:
{
  "id": "unique_id",
  "goal": "описание цели на русском языке",
  "duration": 1,
  "workout": {
    "name": "название тренировки на русском языке",
    "type": "Силовая/Кардио/Функциональная",
    "duration": число в минутах,
    "difficulty": "Легкая/Средняя/Сложная",
    "exercises": [
      {
        "name": "название упражнения на русском языке",
        "sets": число подходов,
        "reps": "число повторений или время",
        "rest": число секунд отдыха,
        "description": "описание техники на русском языке",
        "muscleGroups": ["группа мышц1 на русском", "группа мышц2 на русском"],
        "equipment": ["оборудование1 на русском", "оборудование2 на русском"]
      }
    ],
    "warmup": ["упражнение1 на русском", "упражнение2 на русском"],
    "cooldown": ["упражнение1 на русском", "упражнение2 на русском"]
  },
  "equipment": ["оборудование1 на русском", "оборудование2 на русском"],
  "tips": ["совет1 на русском", "совет2 на русском", "совет3 на русском"]
}

ВАЖНО: ВСЕ ТЕКСТЫ ДОЛЖНЫ БЫТЬ НА РУССКОМ ЯЗЫКЕ! Создай только одну тренировку на день, не на неделю. Учти все ограничения и предпочтения. Сделай план безопасным и эффективным.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Ты эксперт по фитнесу и тренировкам. Создавай простые, эффективные и безопасные планы тренировок."
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
    
    console.log('✅ План тренировки успешно сгенерирован:', planData);

    return NextResponse.json(planData);

  } catch (error) {
    console.error('❌ Ошибка генерации плана тренировок:', error);
    
    // Возвращаем демо-план в случае ошибки
    return NextResponse.json({
      id: 'demo',
      goal: 'Улучшение силы',
      duration: 1,
      workout: {
        name: 'Тренировка груди и трицепса',
        type: 'Силовая',
        duration: 45,
        difficulty: 'Средняя',
        exercises: [
          {
            name: 'Отжимания',
            sets: 3,
            reps: '10-15',
            rest: 60,
            description: 'Классические отжимания от пола',
            muscleGroups: ['Грудь', 'Трицепс'],
            equipment: ['Вес тела']
          },
          {
            name: 'Приседания',
            sets: 3,
            reps: '15-20',
            rest: 60,
            description: 'Классические приседания',
            muscleGroups: ['Ноги', 'Ягодицы'],
            equipment: ['Вес тела']
          }
        ],
        warmup: ['Легкая разминка 5 минут', 'Растяжка мышц'],
        cooldown: ['Растяжка 5 минут', 'Восстановление дыхания']
      },
      equipment: ['Коврик'],
      tips: ['Разминайтесь перед тренировкой', 'Следите за техникой', 'Не пропускайте тренировки']
    });
  }
} 