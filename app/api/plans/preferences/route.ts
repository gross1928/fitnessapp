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

    // Сохраняем предпочтения в таблицу пользователей
    const { error: updateError } = await supabase
      .from('users')
      .update({
        nutrition_preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error saving preferences:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to save preferences: ${updateError.message}` 
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

    if (!telegramUserId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Telegram user ID is required' 
      }, { status: 400 });
    }

    // Получаем пользователя с предпочтениями
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, nutrition_preferences')
      .eq('telegram_id', parseInt(telegramUserId, 10))
      .single();

    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { preferences: user.nutrition_preferences || null } 
    });

  } catch (error) {
    console.error('Error in get preferences API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 