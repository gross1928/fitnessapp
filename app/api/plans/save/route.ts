import { createServiceRoleClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const { planData, planType, name } = await req.json();
    const telegramUserId = req.headers.get('x-telegram-user-id');

    if (!telegramUserId || !planData || !planType) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: telegramUserId, planData, planType' 
      }, { status: 400 });
    }

    // Получаем пользователя по telegram_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', parseInt(telegramUserId, 10))
      .single();

    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Деактивируем все предыдущие планы этого типа
    if (planType === 'workout') {
      await supabase
        .from('user_workout_plans')
        .update({ is_active: false })
        .eq('user_id', user.id);
    } else if (planType === 'nutrition') {
      await supabase
        .from('user_nutrition_plans')
        .update({ is_active: false })
        .eq('user_id', user.id);
    }

    // Сохраняем новый план в соответствующую таблицу
    let savedPlan;
    let saveError;

    if (planType === 'workout') {
      const result = await supabase
        .from('user_workout_plans')
        .insert({
          user_id: user.id,
          plan_data: planData,
          is_active: true,
          name: name || `План тренировок - ${new Date().toLocaleDateString('ru-RU')}`
        })
        .select('id')
        .single();
      
      savedPlan = result.data;
      saveError = result.error;
    } else if (planType === 'nutrition') {
      const result = await supabase
        .from('user_nutrition_plans')
        .insert({
          user_id: user.id,
          plan_data: planData,
          is_active: true,
          name: name || `План питания - ${new Date().toLocaleDateString('ru-RU')}`
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