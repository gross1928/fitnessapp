import { createServiceRoleClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const { searchParams } = new URL(req.url);
    const planType = searchParams.get('planType'); // 'nutrition' или 'workout'
    const telegramUserId = req.headers.get('x-telegram-user-id');

    if (!telegramUserId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Telegram user ID is required' 
      }, { status: 400 });
    }

    if (!planType || !['nutrition', 'workout'].includes(planType)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Plan type must be "nutrition" or "workout"' 
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

    // Получаем активный план пользователя
    let plan;
    let error;

    if (planType === 'workout') {
      const result = await supabase
        .from('user_workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      plan = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('user_nutrition_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      plan = result.data;
      error = result.error;
    }

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching plan:', error);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to fetch plan: ${error.message}` 
      }, { status: 500 });
    }

    // Если план не найден, возвращаем null
    if (!plan) {
      return NextResponse.json({ 
        success: true, 
        data: { plan: null } 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: { plan } 
    });

  } catch (error) {
    console.error('Error in get plan API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 