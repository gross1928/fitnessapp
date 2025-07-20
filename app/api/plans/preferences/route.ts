import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType, preferences } = body;
    const userId = request.headers.get('x-telegram-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!planType || !preferences) {
      return NextResponse.json(
        { error: 'Plan type and preferences are required' },
        { status: 400 }
      );
    }

    let result;

    if (planType === 'workout') {
      // Сохраняем предпочтения тренировок
      result = await supabase
        .from('user_workout_preferences')
        .upsert({
          user_id: userId,
          experience: preferences.experience,
          available_days: preferences.availableDays,
          session_duration: preferences.sessionDuration,
          equipment: preferences.equipment,
          injuries: preferences.injuries,
          fitness_level: preferences.fitnessLevel,
          preferred_exercises: preferences.preferredExercises
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

    } else if (planType === 'nutrition') {
      // Сохраняем предпочтения питания
      result = await supabase
        .from('user_nutrition_preferences')
        .upsert({
          user_id: userId,
          allergies: preferences.allergies,
          likes: preferences.likes,
          dislikes: preferences.dislikes,
          budget: preferences.budget,
          cooking_time: preferences.cookingTime,
          meals_per_day: preferences.mealsPerDay,
          dietary_restrictions: preferences.dietaryRestrictions
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

    } else {
      return NextResponse.json(
        { error: 'Invalid plan type. Must be "workout" or "nutrition"' },
        { status: 400 }
      );
    }

    if (result.error) {
      console.error('Error saving preferences:', result.error);
      return NextResponse.json(
        { error: 'Failed to save preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: result.data
    });

  } catch (error) {
    console.error('Error in save preferences API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-user-id')
    const planType = request.nextUrl.searchParams.get('type') // 'nutrition' или 'workout'
    
    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'Telegram ID не найден' },
        { status: 401 }
      )
    }

    if (!planType) {
      return NextResponse.json(
        { success: false, error: 'Не указан тип плана' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Получаем ID пользователя
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', parseInt(telegramId))
      .single()

    if (checkError || !existingUser) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Получаем предпочтения в зависимости от типа плана
    if (planType === 'nutrition') {
      const { data: preferences, error } = await supabase
        .from('user_nutrition_preferences')
        .select('*')
        .eq('user_id', existingUser.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Ошибка получения предпочтений питания:', error)
        return NextResponse.json(
          { success: false, error: 'Ошибка получения предпочтений' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: preferences || null
      })
    } else if (planType === 'workout') {
      const { data: preferences, error } = await supabase
        .from('user_workout_preferences')
        .select('*')
        .eq('user_id', existingUser.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Ошибка получения предпочтений тренировок:', error)
        return NextResponse.json(
          { success: false, error: 'Ошибка получения предпочтений' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: preferences || null
      })
    }

    return NextResponse.json(
      { success: false, error: 'Неверный тип плана' },
      { status: 400 }
    )

  } catch (error) {
    console.error('💥 Критическая ошибка API предпочтений:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
} 