'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Droplets, 
  Apple, 
  Weight, 
  Moon, 
  FileText, 
  Plus,
  TrendingUp,
  Calendar,
  Target,
  Activity,
  AlertCircle
} from 'lucide-react'



function MetricCard({ 
  title, 
  value, 
  target, 
  unit, 
  icon, 
  color,
  trend 
}: {
  title: string
  value: number
  target?: number
  unit: string
  icon: React.ReactNode
  color: string
  trend?: { value: number; isPositive: boolean }
}) {
  const percentage = target ? Math.min((value / target) * 100, 100) : 100
  
  return (
    <div className={`p-4 rounded-2xl shadow-lg ${color} text-white relative overflow-hidden card-hover`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-white/20 rounded-xl">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-100' : 'text-red-100'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${!trend.isPositive && 'rotate-180'}`} />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        
        <h3 className="text-sm font-medium opacity-90 mb-1">{title}</h3>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold">{value.toLocaleString('ru-RU')}</span>
            <span className="text-sm opacity-80 ml-1">{unit}</span>
          </div>
          {target && (
            <span className="text-xs opacity-70">{target.toLocaleString('ru-RU')}</span>
          )}
        </div>
        
        {target && (
          <div className="mt-3">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function QuickActionButton({ 
  icon, 
  label, 
  onClick,
  color = 'bg-gradient-to-br from-white to-gray-50',
  textColor = 'text-gray-700'
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color?: string
  textColor?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`${color} p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100/50 group relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className={`${textColor} mb-3 flex justify-center group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <p className={`text-sm font-semibold ${textColor} text-center leading-tight`}>{label}</p>
      </div>
    </button>
  )
}



export default function DashboardPage() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [waterIntake, setWaterIntake] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Функции для быстрых действий
  const handleAddFood = () => {
    // Telegram WebApp haptic feedback
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
    }
    router.push('/nutrition/add')
  }

  const handleAddWater = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }
    router.push('/nutrition/add')
  }

  const handleAddWeight = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
      window.Telegram.WebApp.showAlert('Функция "Взвеситься" скоро будет доступна! ⚖️')
    } else {
      alert('Функция "Взвеситься" скоро будет доступна! ⚖️')
    }
  }

  const handleUploadAnalysis = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy')
      window.Telegram.WebApp.showAlert('Функция "Загрузить анализы" скоро будет доступна! 📋')
    } else {
      alert('Функция "Загрузить анализы" скоро будет доступна! 📋')
    }
  }

  const handleGoals = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
      router.push('/onboarding') // Пока перенаправляем на онбординг
    } else {
      router.push('/onboarding')
    }
  }

  const handleHistory = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
      window.Telegram.WebApp.showAlert('Функция "История" скоро будет доступна! 📅')
    } else {
      alert('Функция "История" скоро будет доступна! 📅')
    }
  }

  useEffect(() => {
    const registerUser = async (telegramUser: any) => {
      try {
        console.log('📝 Регистрация пользователя:', telegramUser)
        
        // Вызываем API автоматической регистрации
        const registerResponse = await fetch('/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-telegram-user-id': telegramUser.id.toString()
          },
          body: JSON.stringify({
            username: telegramUser.username,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            language_code: telegramUser.language_code
          })
        })

        if (registerResponse.ok) {
          const registerData = await registerResponse.json()
          console.log('✅ Результат регистрации:', registerData)
          
          if (registerData.success) {
            console.log('🔍 Результат проверки:', {
              needsOnboarding: registerData.needsOnboarding,
              isNewUser: registerData.isNewUser,
              message: registerData.message
            })
            
            if (registerData.needsOnboarding) {
              console.log('🚀 Пользователю нужен онбординг, перенаправляем...')
              router.push('/onboarding')
              return
            } else {
              console.log('✨ Пользователь полностью настроен, загружаем дашборд')
              setUser(registerData.data)
            }
          } else {
            console.error('❌ Ошибка регистрации:', registerData.error)
            setError(`Ошибка регистрации: ${registerData.error}`)
          }
        } else {
          const errorData = await registerResponse.json()
          console.error('🔥 Ошибка запроса регистрации:', errorData)
          setError(`Ошибка сервера: ${registerResponse.status} - ${errorData.error || 'Неизвестная ошибка'}`)
        }
      } catch (error) {
        console.error('💥 Ошибка регистрации пользователя:', error)
        setError(`Ошибка подключения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
      } finally {
        setLoading(false)
      }
    }

    const initializeUser = async () => {
      try {
        console.log('🚀 Начало инициализации пользователя')
        console.log('🔍 window:', typeof window !== 'undefined' ? 'доступен' : 'недоступен')
        console.log('🔍 window.Telegram:', typeof window !== 'undefined' ? !!window.Telegram : 'не проверен')
        
        // Проверяем доступность Telegram WebApp
        let telegramUser = null
        let telegramDataSource = 'fallback'
        
        if (typeof window !== 'undefined') {
          // Ждем немного для загрузки Telegram WebApp скрипта
          await new Promise(resolve => setTimeout(resolve, 100))
          
          if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp
            console.log('📱 Telegram WebApp найден:', {
              platform: tg.platform,
              version: tg.version,
              colorScheme: tg.colorScheme,
              isExpanded: tg.isExpanded,
              viewportHeight: tg.viewportHeight
            })
            
            // Инициализируем WebApp
            tg.ready()
            console.log('📋 initDataUnsafe:', tg.initDataUnsafe)
            console.log('📋 initData length:', tg.initData?.length || 0)
            
            telegramUser = tg.initDataUnsafe?.user
            if (telegramUser?.id) {
              telegramDataSource = 'telegram'
              console.log('👤 Реальный Telegram user найден:', telegramUser)
            } else {
              console.log('⚠️ initDataUnsafe.user пуст или недоступен')
            }
          } else {
            console.log('⚠️ window.Telegram.WebApp недоступен')
            if (window.Telegram) {
              console.log('📱 window.Telegram существует, но WebApp:', window.Telegram.WebApp)
            } else {
              console.log('📱 window.Telegram не существует')
            }
          }
        }
        
        // Если нет данных пользователя из Telegram - используем тестовые данные
        if (!telegramUser?.id) {
          console.log('🧪 Используем тестовые данные пользователя')
          
          telegramUser = {
            id: 6103273611,
            username: 'grossvn',
            first_name: 'Гросс',
            last_name: '',
            language_code: 'ru'
          }
          telegramDataSource = 'fallback'
        }

        console.log('📊 Итоговые данные пользователя:', {
          source: telegramDataSource,
          user: telegramUser
        })

        // Регистрируем пользователя
        await registerUser(telegramUser)
        
      } catch (error) {
        console.error('💥 Критическая ошибка инициализации:', error)
        setError(`Критическая ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
        
        // В случае любой ошибки - тоже используем тестовые данные
        const fallbackUser = {
          id: 6103273611,
          username: 'grossvn',
          first_name: 'Гросс',
          last_name: '',
          language_code: 'ru'
        }
        console.log('🔧 Fallback: используем тестового пользователя')
        await registerUser(fallbackUser)
      }
    }

    initializeUser()
  }, [router])

  // Загружаем данные о воде когда пользователь загружен
  useEffect(() => {
    const loadWaterData = async () => {
      if (!user?.id) return

      try {
        // Используем тестовый ID если это fallback пользователь
        const telegramId = user.telegram_id || 6103273611
        
        const response = await fetch('/api/nutrition/water', {
          headers: {
            'x-telegram-user-id': telegramId.toString()
          }
        })

        const result = await response.json()

        if (result.success) {
          setWaterIntake(result.data.totalToday)
        } else {
          console.error('Ошибка загрузки данных о воде:', result.error)
        }
      } catch (error) {
        console.error('Ошибка загрузки данных о воде:', error)
      }
    }

    loadWaterData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Ошибка:</span>
              </div>
              <p className="mt-1 text-sm">{error}</p>
              <p className="mt-2 text-xs text-red-600">
                Проверьте консоль браузера для подробностей (F12)
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Если есть ошибка но загрузка завершена
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Ошибка загрузки</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </button>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left">
            <p className="text-xs text-gray-500 mb-2">Отладочная информация:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• URL: {window.location.href}</li>
              <li>• User Agent: {navigator.userAgent.substring(0, 50)}...</li>
              <li>• Telegram: {typeof window !== 'undefined' && window.Telegram ? 'Да' : 'Нет'}</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
  
  const timeOfDay = currentTime.getHours() < 12 ? 'утром' : 
                   currentTime.getHours() < 18 ? 'днем' : 'вечером'

  // Если у реального пользователя нет целей - перенаправляем на онбординг (fallback пользователю не нужен онбординг)
  if (user && (!user.daily_calorie_target || !user.goal_type)) {
    console.log('🎯 У пользователя нет целей по питанию, нужен онбординг')
    router.push('/onboarding')
    return null
  }

  // Если нет пользователя, но нет ошибки - показываем загрузку
  if (!user && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Инициализация пользователя...</p>
        </div>
      </div>
    )
  }

  // Если нет пользователя и есть ошибка - используем fallback данные
  const fallbackUser = !user ? {
    id: 6103273611,
    name: 'Тестовый пользователь',
    username: 'test_user',
    daily_calorie_target: 2000,
    daily_protein_target: 100,
    daily_fat_target: 60,
    daily_carb_target: 200,
    daily_water_target: 2000,
    current_weight: 70,
    goal_type: 'maintain'
  } : user

  // Используем данные пользователя или fallback
  const activeUser = fallbackUser
  const todayData = {
    calories: { current: 0, target: activeUser.daily_calorie_target || 2000 },
    proteins: { current: 0, target: activeUser.daily_protein_target || 100 },
    fats: { current: 0, target: activeUser.daily_fat_target || 60 },
    carbs: { current: 0, target: activeUser.daily_carb_target || 200 },
    water: { current: waterIntake, target: activeUser.daily_water_target || 2000 },
    weight: activeUser.current_weight || 0,
    steps: 0
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-6 pb-4 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-3xl shadow-2xl border border-green-400/30 relative overflow-hidden">
          {/* Светящийся фон */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-emerald-500/20 to-teal-600/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)]" />
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl" 
                style={{
                  textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.4)',
                  filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.9))'
                }}>
              ДаЕда
            </h1>
            <p className="text-green-100 text-lg font-medium leading-relaxed">
              Добро пожаловать, <span className="text-yellow-300 font-bold">{activeUser?.name || 'Пользователь'}</span>! 
              <br />
              <span className="text-emerald-200">Хорошего дня {timeOfDay} 👋</span>
            </p>
            {!user && (
              <div className="mt-4 px-4 py-2 bg-amber-400/20 border border-amber-300/40 rounded-xl text-amber-200 text-sm backdrop-blur-sm">
                <span className="font-bold text-amber-300">Демо режим:</span> Используются тестовые данные
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Калории"
            value={todayData.calories.current}
            target={todayData.calories.target}
            unit="ккал"
            icon={<Apple className="w-6 h-6" />}
            color="bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-500/30"
          />
          
          <MetricCard
            title="Вода"
            value={todayData.water.current}
            target={todayData.water.target}
            unit="мл"
            icon={<Droplets className="w-6 h-6" />}
            color="bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30"
          />
        </div>

        {/* Nutrition breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            title="Белки"
            value={todayData.proteins.current}
            target={todayData.proteins.target}
            unit="г"
            icon={<div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">Б</div>}
            color="bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-400/30"
          />
          
          <MetricCard
            title="Жиры"
            value={todayData.fats.current}
            target={todayData.fats.target}
            unit="г"
            icon={<div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-yellow-600 font-bold text-sm">Ж</div>}
            color="bg-gradient-to-br from-yellow-400 to-amber-500 shadow-yellow-400/30"
          />
          
          <MetricCard
            title="Углеводы"
            value={todayData.carbs.current}
            target={todayData.carbs.target}
            unit="г"
            icon={<div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-green-600 font-bold text-sm">У</div>}
            color="bg-gradient-to-br from-green-400 to-emerald-600 shadow-green-400/30"
          />
        </div>

        {/* Other metrics */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Текущий вес"
            value={todayData.weight}
            unit="кг"
            icon={<Weight className="w-6 h-6" />}
            color="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
          />
          
          <MetricCard
            title="Активность"
            value={todayData.steps}
            unit="шагов"
            icon={<Activity className="w-6 h-6" />}
            color="bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/30"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 shadow-2xl border border-green-200/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-green-600" />
              Быстрые действия
            </h3>
          
                      <div className="grid grid-cols-2 gap-4">
              <QuickActionButton
                icon={<Apple className="w-7 h-7" />}
                label="Добавить еду"
                onClick={handleAddFood}
                color="bg-gradient-to-br from-orange-400 to-red-500"
                textColor="text-white"
              />
              
              <QuickActionButton
                icon={<Droplets className="w-7 h-7" />}
                label="Выпить воды"
                onClick={handleAddWater}
                color="bg-gradient-to-br from-blue-400 to-cyan-500"
                textColor="text-white"
              />
              
              <QuickActionButton
                icon={<Weight className="w-7 h-7" />}
                label="Взвеситься"
                onClick={handleAddWeight}
                color="bg-gradient-to-br from-green-400 to-emerald-500"
                textColor="text-white"
              />
              
              <QuickActionButton
                icon={<FileText className="w-7 h-7" />}
                label="Загрузить анализы"
                onClick={handleUploadAnalysis}
                color="bg-gradient-to-br from-purple-400 to-indigo-500"
                textColor="text-white"
              />
              
              <QuickActionButton
                icon={<Target className="w-7 h-7" />}
                label="Мои цели"
                onClick={handleGoals}
                color="bg-gradient-to-br from-pink-400 to-rose-500"
                textColor="text-white"
              />
              
              <QuickActionButton
                icon={<Calendar className="w-7 h-7" />}
                label="История"
                onClick={handleHistory}
                color="bg-gradient-to-br from-yellow-400 to-amber-500"
                textColor="text-white"
              />
            </div>
          </div>
        </div>





        {/* Bottom padding for safe area */}
        <div className="h-8" />
      </div>
    </div>
  )
} 