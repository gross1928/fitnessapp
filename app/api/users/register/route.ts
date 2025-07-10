import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const telegramId = request.headers.get('x-telegram-user-id')
    
    console.log('Автоматическая регистрация для telegram_id:', telegramId)
    console.log('Telegram данные:', body)
    
    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'Telegram ID не найден' },
        { status: 401 }
      )
    }

    const {
      username,
      first_name,
      last_name,
      language_code
    } = body

    const supabase = createServerClient()

    // Проверяем, существует ли пользователь
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', parseInt(telegramId))

    if (checkError) {
      console.error('Ошибка проверки существующего пользователя:', checkError)
      return NextResponse.json(
        { success: false, error: 'Ошибка проверки пользователя' },
        { status: 500 }
      )
    }

    const existingUser = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null

    if (existingUser) {
      console.log('Пользователь уже существует:', existingUser.id)
      
      // Обновляем базовую информацию пользователя (на случай изменений в Telegram)
      const { data: users, error: updateError } = await supabase
        .from('users')
        .update({
          username,
          first_name,
          last_name,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', parseInt(telegramId))
        .select()

      if (updateError) {
        console.error('Ошибка обновления пользователя:', updateError)
        // Не критичная ошибка, возвращаем существующего пользователя
      }

      return NextResponse.json({
        success: true,
        data: users && users.length > 0 ? users[0] : existingUser,
        isNewUser: false,
        needsOnboarding: !existingUser.name || !existingUser.age || !existingUser.current_weight,
        message: 'Пользователь найден'
      })
    } else {
      console.log('Создаем нового пользователя')
      
      // Создаем нового пользователя с базовой информацией
      const newUserData = {
        telegram_id: parseInt(telegramId),
        username,
        first_name,
        last_name,
        name: first_name + (last_name ? ' ' + last_name : ''), // Базовое имя из Telegram
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Данные нового пользователя:', newUserData)

      const { data: users, error } = await supabase
        .from('users')
        .insert(newUserData)
        .select()

      if (error) {
        console.error('Ошибка создания пользователя:', error)
        return NextResponse.json(
          { success: false, error: 'Ошибка создания профиля' },
          { status: 500 }
        )
      }

      if (!users || users.length === 0) {
        console.error('Пользователь не был создан')
        return NextResponse.json(
          { success: false, error: 'Пользователь не был создан' },
          { status: 500 }
        )
      }

      console.log('Новый пользователь успешно создан:', users[0].id)
      return NextResponse.json({
        success: true,
        data: users[0],
        isNewUser: true,
        needsOnboarding: true,
        message: 'Добро пожаловать! Пользователь зарегистрирован.'
      })
    }

  } catch (error) {
    console.error('Ошибка API регистрации:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 