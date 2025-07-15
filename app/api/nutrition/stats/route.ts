import { createServiceRoleClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const telegramUserId = searchParams.get('userId')

  if (!telegramUserId) {
    return NextResponse.json({ success: false, error: 'Telegram user ID is required' }, { status: 400 })
  }

  try {
    const supabase = createServiceRoleClient()
    
    // 1. Найти пользователя по Telegram ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', parseInt(telegramUserId, 10))
      .single()

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // 2. Получить суммарную статистику за сегодня
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data, error: statsError } = await supabase.rpc('get_daily_nutrition', {
      user_uuid: user.id,
      target_date: today
    }).single();
    
    if (statsError) {
      throw new Error(`Database RPC error: ${statsError.message}`)
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('[Nutrition Stats API Error]', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
} 