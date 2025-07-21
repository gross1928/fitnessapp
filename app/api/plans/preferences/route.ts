import { createServiceRoleClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const { planType, preferences } = await req.json();
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

    let saveError;

    if (planType === 'nutrition') {
      // Сохраняем предпочтения питания
      const { error } = await supabase
        .from('user_nutrition_preferences')
        .upsert({
          user_id: user.id,
          allergies: preferences.allergies || [],
          likes: preferences.likes || [],
          dislikes: preferences.dislikes || [],
          budget: preferences.budget || 'medium',
          cooking_time: preferences.cookingTime || 'medium',
          meals_per_day: preferences.mealsPerDay || 3,
          dietary_restrictions: preferences.dietaryRestrictions || [],
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      saveError = error;
    } else if (planType === 'workout') {
      // Сохраняем предпочтения тренировок
      const { error } = await supabase
        .from('user_workout_preferences')
        .upsert({
          user_id: user.id,
          experience: preferences.experience || 'beginner',
          available_days: preferences.availableDays || [1, 3, 5],
          session_duration: preferences.sessionDuration || 'medium',
          equipment: preferences.equipment || [],
          injuries: preferences.injuries || [],
          fitness_level: preferences.fitnessLevel || 5,
          preferred_exercises: preferences.preferredExercises || [],
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      saveError = error;
    }

    if (saveError) {
      console.error('Error saving preferences:', saveError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to save preferences: ${saveError.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { message: 'Preferences saved successfully' } 
    });

  } catch (error) {
    console.error('Error in save preferences API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const telegramUserId = req.headers.get('x-telegram-user-id');
    const { searchParams } = new URL(req.url);
    const planType = searchParams.get('planType');

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

    // Получаем пользователя
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

    let preferences;
    let error;

    if (planType === 'nutrition') {
      // Получаем предпочтения питания
      const result = await supabase
        .from('user_nutrition_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      preferences = result.data;
      error = result.error;
    } else if (planType === 'workout') {
      // Получаем предпочтения тренировок
      const result = await supabase
        .from('user_workout_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      preferences = result.data;
      error = result.error;
    }

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching preferences:', error);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to fetch preferences: ${error.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { preferences: preferences || null } 
    });

  } catch (error) {
    console.error('Error in get preferences API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 