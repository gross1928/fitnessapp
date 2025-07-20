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
Создай персональный план тренировок на неделю для человека со следующими характеристиками:

Цель: ${goals}
Опыт: ${experience}
Дни тренировок: ${availableDays.join(', ')}
Длительность сессии: ${sessionDuration}
Оборудование: ${equipment.join(', ') || 'Только вес тела'}
Травмы/ограничения: ${injuries.join(', ') || 'Нет'}
Уровень подготовки: ${fitnessLevel}/10
Предпочитаемые упражнения: ${preferredExercises.join(', ') || 'Любые'}

Создай план в формате JSON со следующей структурой:
{
  "id": "unique_id",
  "goal": "описание цели",
  "duration": 1,
  "workouts": [
    {
      "day": 1,
      "name": "название тренировки",
      "type": "Силовая/Кардио/Функциональная",
      "duration": число в минутах,
      "difficulty": "Легкая/Средняя/Сложная",
      "exercises": [
        {
          "name": "название упражнения",
          "sets": число подходов,
          "reps": "число повторений или время",
          "rest": число секунд отдыха,
          "description": "описание техники",
          "muscleGroups": ["группа мышц1", "группа мышц2"],
          "equipment": ["оборудование1", "оборудование2"]
        }
      ],
      "warmup": ["упражнение1", "упражнение2"],
      "cooldown": ["упражнение1", "упражнение2"]
    },
    {
      "day": 2,
      "name": "название тренировки",
      "type": "Силовая/Кардио/Функциональная",
      "duration": число в минутах,
      "difficulty": "Легкая/Средняя/Сложная",
      "exercises": [
        {
          "name": "название упражнения",
          "sets": число подходов,
          "reps": "число повторений или время",
          "rest": число секунд отдыха,
          "description": "описание техники",
          "muscleGroups": ["группа мышц1", "группа мышц2"],
          "equipment": ["оборудование1", "оборудование2"]
        }
      ],
      "warmup": ["упражнение1", "упражнение2"],
      "cooldown": ["упражнение1", "упражнение2"]
    },
    {
      "day": 3,
      "name": "название тренировки",
      "type": "Силовая/Кардио/Функциональная",
      "duration": число в минутах,
      "difficulty": "Легкая/Средняя/Сложная",
      "exercises": [
        {
          "name": "название упражнения",
          "sets": число подходов,
          "reps": "число повторений или время",
          "rest": число секунд отдыха,
          "description": "описание техники",
          "muscleGroups": ["группа мышц1", "группа мышц2"],
          "equipment": ["оборудование1", "оборудование2"]
        }
      ],
      "warmup": ["упражнение1", "упражнение2"],
      "cooldown": ["упражнение1", "упражнение2"]
    },
    {
      "day": 4,
      "name": "название тренировки",
      "type": "Силовая/Кардио/Функциональная",
      "duration": число в минутах,
      "difficulty": "Легкая/Средняя/Сложная",
      "exercises": [
        {
          "name": "название упражнения",
          "sets": число подходов,
          "reps": "число повторений или время",
          "rest": число секунд отдыха,
          "description": "описание техники",
          "muscleGroups": ["группа мышц1", "группа мышц2"],
          "equipment": ["оборудование1", "оборудование2"]
        }
      ],
      "warmup": ["упражнение1", "упражнение2"],
      "cooldown": ["упражнение1", "упражнение2"]
    },
    {
      "day": 5,
      "name": "название тренировки",
      "type": "Силовая/Кардио/Функциональная",
      "duration": число в минутах,
      "difficulty": "Легкая/Средняя/Сложная",
      "exercises": [
        {
          "name": "название упражнения",
          "sets": число подходов,
          "reps": "число повторений или время",
          "rest": число секунд отдыха,
          "description": "описание техники",
          "muscleGroups": ["группа мышц1", "группа мышц2"],
          "equipment": ["оборудование1", "оборудование2"]
        }
      ],
      "warmup": ["упражнение1", "упражнение2"],
      "cooldown": ["упражнение1", "упражнение2"]
    },
    {
      "day": 6,
      "name": "название тренировки",
      "type": "Силовая/Кардио/Функциональная",
      "duration": число в минутах,
      "difficulty": "Легкая/Средняя/Сложная",
      "exercises": [
        {
          "name": "название упражнения",
          "sets": число подходов,
          "reps": "число повторений или время",
          "rest": число секунд отдыха,
          "description": "описание техники",
          "muscleGroups": ["группа мышц1", "группа мышц2"],
          "equipment": ["оборудование1", "оборудование2"]
        }
      ],
      "warmup": ["упражнение1", "упражнение2"],
      "cooldown": ["упражнение1", "упражнение2"]
    },
    {
      "day": 7,
      "name": "название тренировки",
      "type": "Силовая/Кардио/Функциональная",
      "duration": число в минутах,
      "difficulty": "Легкая/Средняя/Сложная",
      "exercises": [
        {
          "name": "название упражнения",
          "sets": число подходов,
          "reps": "число повторений или время",
          "rest": число секунд отдыха,
          "description": "описание техники",
          "muscleGroups": ["группа мышц1", "группа мышц2"],
          "equipment": ["оборудование1", "оборудование2"]
        }
      ],
      "warmup": ["упражнение1", "упражнение2"],
      "cooldown": ["упражнение1", "упражнение2"]
    }
  ],
  "equipment": ["оборудование1", "оборудование2"]
}

ВАЖНО: Создай тренировки для ВСЕХ 7 дней недели (дни 1-7). Не пропускай дни!
Учти все ограничения и предпочтения. Сделай план прогрессивным и безопасным.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Ты эксперт по фитнесу и тренировкам. Создавай только валидный JSON без дополнительного текста."
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
    console.error('Ошибка генерации плана тренировок:', error);
    return NextResponse.json(
      { error: 'Ошибка генерации плана тренировок' },
      { status: 500 }
    );
  }
} 