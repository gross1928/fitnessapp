import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GeneratedPlan, PlanGenerationParams } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are a highly intelligent personal trainer and nutritionist. Your task is to generate a combined workout and nutrition plan based on user's parameters.
You MUST return the plan in a valid JSON format. Do not add any introductory text or explanations outside of the JSON structure.

The user will provide their goals, experience level, preferred workout days, food preferences, and personal information (age, sex, height, weight).

Based on this, you must generate a plan with two main keys: "nutrition_plan" and "workout_plan".

- "nutrition_plan" should be an array of objects, where each object represents a day of the week (day_of_week: 1-7). Each day should contain an array of meals. Each meal object must have "meal_type", "description", "calories", "protein", "fats", and "carbs".
- "workout_plan" should be an array of objects, where each object represents a workout day. A workout day is only generated for the days specified by the user in "workout_days". Each workout day object must have "day_of_week", a "description" (e.g., "Chest and Triceps"), and an array of "exercises". Each exercise must have "name", "sets", "reps", and "rest_seconds".

Calculate a realistic and healthy calorie and macronutrient target based on the user's data and goals (e.g., using Mifflin-St Jeor or a similar formula for BMR and TDEE). The nutrition plan should align with this target.
The workout plan should be appropriate for the user's experience level.

The final JSON output MUST strictly follow this structure:
{
  "nutrition_plan": [
    {
      "day_of_week": 1,
      "meals": [
        { "meal_type": "breakfast", "description": "Oatmeal with berries", "calories": 400, "protein": 15, "fats": 10, "carbs": 60 },
        { "meal_type": "lunch", "description": "Grilled chicken salad", "calories": 500, "protein": 40, "fats": 20, "carbs": 30 },
        { "meal_type": "dinner", "description": "Salmon with quinoa", "calories": 600, "protein": 45, "fats": 25, "carbs": 40 }
      ]
    }
    // ... other days
  ],
  "workout_plan": [
    {
      "day_of_week": 1,
      "description": "Full Body Strength A",
      "exercises": [
        { "name": "Squats", "sets": 3, "reps": "8-12", "rest_seconds": 60 },
        { "name": "Bench Press", "sets": 3, "reps": "8-12", "rest_seconds": 60 },
        { "name": "Rows", "sets": 3, "reps": "8-12", "rest_seconds": 60 }
      ]
    }
    // ... other workout days based on user input
  ]
}
`;


export async function POST(req: NextRequest) {
  try {
    const body: PlanGenerationParams = await req.json();

    const userMessage = `
      Generate a plan for me with the following parameters:
      - Goal: ${body.goal}
      - Experience: ${body.experience}
      - Workout Days (1=Monday, 7=Sunday): ${body.workout_days.join(', ')}
      - Food Preferences: ${body.food_preferences}
      - User Info: Age ${body.user_info.age}, Sex ${body.user_info.sex}, Height ${body.user_info.height}cm, Weight ${body.user_info.weight}kg.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // Or your preferred model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      return NextResponse.json({ error: 'Failed to generate plan. No content from AI.' }, { status: 500 });
    }

    const plan: GeneratedPlan = JSON.parse(content);

    return NextResponse.json(plan);

  } catch (error) {
    console.error('Error generating plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to generate plan.', details: errorMessage }, { status: 500 });
  }
} 