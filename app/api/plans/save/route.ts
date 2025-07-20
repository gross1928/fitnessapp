import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType, planData, name } = body;
    const userId = request.headers.get('x-telegram-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!planType || !planData) {
      return NextResponse.json(
        { error: 'Plan type and plan data are required' },
        { status: 400 }
      );
    }

    let result;
    const planName = name || (planType === 'workout' ? 'Мой план тренировок' : 'Мой план питания');

    if (planType === 'workout') {
      // Деактивируем все предыдущие планы тренировок
      await supabase
        .from('user_workout_plans')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Сохраняем новый план
      result = await supabase
        .from('user_workout_plans')
        .insert({
          user_id: userId,
          plan_data: planData,
          name: planName,
          is_active: true
        })
        .select()
        .single();

    } else if (planType === 'nutrition') {
      // Деактивируем все предыдущие планы питания
      await supabase
        .from('user_nutrition_plans')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Сохраняем новый план
      result = await supabase
        .from('user_nutrition_plans')
        .insert({
          user_id: userId,
          plan_data: planData,
          name: planName,
          is_active: true
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
      console.error('Error saving plan:', result.error);
      return NextResponse.json(
        { error: 'Failed to save plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: result.data
    });

  } catch (error) {
    console.error('Error in save plan API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 