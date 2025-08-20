import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { createServiceRoleClient } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🧪 Тестирование подключения к Supabase...')
    
    // Проверяем переменные окружения
    console.log('🔧 Переменные окружения:')
    console.log('🔧 NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Установлен' : '❌ Отсутствует')
    console.log('🔧 SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Установлен' : '❌ Отсутствует')
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Отсутствуют переменные окружения Supabase',
        missing: {
          url: !process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: !process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      }, { status: 500 })
    }
    
    // Создаем клиент
    const supabase = createServiceRoleClient()
    console.log('🔧 Supabase клиент создан')
    
    // Пробуем простой запрос
    console.log('🔧 Выполняем тестовый запрос...')
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Ошибка тестового запроса:', error)
      return NextResponse.json({
        success: false,
        error: 'Ошибка подключения к базе данных',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }
    
    console.log('✅ Тестовый запрос выполнен успешно')
    
    return NextResponse.json({
      success: true,
      message: 'Подключение к Supabase работает корректно',
      data: data,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('💥 Критическая ошибка тестирования:', error)
    return NextResponse.json({
      success: false,
      error: 'Внутренняя ошибка сервера',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
