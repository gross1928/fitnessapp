import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// Client-side Supabase client
export const createClient = () => {
  return createClientComponentClient<Database>()
}

// Server-side Supabase client
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Service role client (bypasses RLS) for administrative operations
export const createServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('🔧 createServiceRoleClient - проверка переменных:')
  console.log('🔧 NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : '❌ Отсутствует')
  console.log('🔧 SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? `${serviceRoleKey.substring(0, 20)}...` : '❌ Отсутствует')

  if (!supabaseUrl) {
    console.error('❌ Отсутствует NEXT_PUBLIC_SUPABASE_URL')
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!serviceRoleKey) {
    console.error('❌ Отсутствует SUPABASE_SERVICE_ROLE_KEY')
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  console.log('🔧 Создаем Supabase клиент с URL:', supabaseUrl)
  
  try {
    const client = createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    console.log('🔧 Supabase клиент успешно создан')
    return client
  } catch (error) {
    console.error('💥 Ошибка создания Supabase клиента:', error)
    throw error
  }
}

// Supabase URL and keys (с проверкой)
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
} 