import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-telegram-user-id');
    const { searchParams } = new URL(request.url);
    const planType = searchParams.get('type'); // 'workout', 'nutrition', or null for all

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let result;

    if (planType === 'workout') {
      // Получаем только планы тренировок
      result = await supabase
        .from('user_workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    } else if (planType === 'nutrition') {
      // Получаем только планы питания
      result = await supabase
        .from('user_nutrition_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    } else {
      // Получаем все планы
      const [workoutPlans, nutritionPlans] = await Promise.all([
        supabase
          .from('user_workout_plans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_nutrition_plans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
      ]);

      return NextResponse.json({
        success: true,
        workoutPlans: workoutPlans.data || [],
        nutritionPlans: nutritionPlans.data || []
      });
    }

    if (result.error) {
      console.error('Error fetching plans:', result.error);
      return NextResponse.json(
        { error: 'Failed to fetch plans' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plans: result.data || []
    });

  } catch (error) {
    console.error('Error in get plans API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 