import { createServiceRoleClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const { plan, userId, planType } = await req.json();

    if (!userId || !plan || !planType) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: userId, plan, planType' 
      }, { status: 400 });
    }

    // Деактивируем все предыдущие планы этого типа
    if (planType === 'workout') {
      await supabase
        .from('user_workout_plans')
        .update({ is_active: false })
        .eq('user_id', userId);
    } else if (planType === 'nutrition') {
      await supabase
        .from('user_nutrition_plans')
        .update({ is_active: false })
        .eq('user_id', userId);
    }

    // Сохраняем новый план в соответствующую таблицу
    let savedPlan;
    let saveError;

    if (planType === 'workout') {
      const result = await supabase
        .from('user_workout_plans')
        .insert({
          user_id: userId,
          plan_data: plan,
          is_active: true
        })
        .select('id')
        .single();
      
      savedPlan = result.data;
      saveError = result.error;
    } else if (planType === 'nutrition') {
      const result = await supabase
        .from('user_nutrition_plans')
        .insert({
          user_id: userId,
          plan_data: plan,
          is_active: true
        })
        .select('id')
        .single();
      
      savedPlan = result.data;
      saveError = result.error;
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid plan type. Must be "workout" or "nutrition"' 
      }, { status: 400 });
    }

    if (saveError) {
      console.error('Error saving plan:', saveError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to save plan: ${saveError.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { planId: savedPlan?.id } 
    });

  } catch (error) {
    console.error('Error in save plan API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 