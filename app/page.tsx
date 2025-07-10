'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Heart, 
  Droplets, 
  Apple, 
  Weight, 
  Moon, 
  FileText, 
  Plus,
  TrendingUp,
  Calendar,
  Target,
  Activity
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
            <span className="text-xs opacity-70">из {target.toLocaleString('ru-RU')}</span>
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
  color = 'bg-white'
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`${color} p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100`}
    >
      <div className="text-gray-600 mb-2 flex justify-center">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-800 text-center">{label}</p>
    </button>
  )
}



export default function DashboardPage() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Автоматическая регистрация/авторизация пользователя
    const initializeUser = async () => {
      try {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp
          tg.ready()
          
          const telegramUser = tg.initDataUnsafe?.user
          if (!telegramUser?.id) {
            console.log('Нет данных Telegram пользователя')
            setLoading(false)
            return
          }

          console.log('Инициализация пользователя:', telegramUser)

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
            console.log('Результат регистрации:', registerData)
            
            if (registerData.success) {
              console.log('Результат проверки:', {
                needsOnboarding: registerData.needsOnboarding,
                isNewUser: registerData.isNewUser,
                message: registerData.message
              })
              
              if (registerData.needsOnboarding) {
                console.log('Пользователю нужен онбординг, перенаправляем...')
                router.push('/onboarding')
                return
              } else {
                console.log('Пользователь полностью настроен, загружаем дашборд')
                setUser(registerData.data)
              }
            } else {
              console.error('Ошибка регистрации:', registerData.error)
            }
          } else {
            const errorData = await registerResponse.json()
            console.error('Ошибка запроса регистрации:', errorData)
          }
        } else {
          // Если нет Telegram WebApp, показываем заглушку
          console.log('Приложение запущено вне Telegram')
          setLoading(false)
        }
      } catch (error) {
        console.error('Ошибка инициализации пользователя:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }
  
  const timeOfDay = currentTime.getHours() < 12 ? 'утром' : 
                   currentTime.getHours() < 18 ? 'днем' : 'вечером'

  // Если пользователь есть, но нет целей по питанию - перенаправляем на онбординг
  if (user && (!user.daily_calorie_target || !user.goal_type)) {
    console.log('У пользователя нет целей по питанию, нужен онбординг')
    router.push('/onboarding')
    return null
  }

  // Если нет пользователя, показываем заглушку
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">ДаЕда</h1>
          <p className="text-gray-600 mb-6">
            Пожалуйста, запустите приложение через Telegram
          </p>
          <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <p className="text-sm text-gray-500">
              Это приложение работает только как Telegram WebApp
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Используем данные пользователя вместо моков
  const todayData = {
    calories: { current: 0, target: user.daily_calorie_target || 2000 },
    proteins: { current: 0, target: user.daily_protein_target || 100 },
    fats: { current: 0, target: user.daily_fat_target || 60 },
    carbs: { current: 0, target: user.daily_carb_target || 200 },
    water: { current: 0, target: user.daily_water_target || 2000 },
    weight: user.current_weight || 0,
    steps: 0
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4 pb-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ДаЕда
          </h1>
          <p className="text-gray-600">
            Добро пожаловать, {user?.name || 'Пользователь'}! 
            <br />
            Хорошего дня {timeOfDay} 👋
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Калории"
            value={todayData.calories.current}
            target={todayData.calories.target}
            unit="ккал"
            icon={<Apple className="w-6 h-6" />}
            color="gradient-orange"
          />
          
          <MetricCard
            title="Вода"
            value={todayData.water.current}
            target={todayData.water.target}
            unit="мл"
            icon={<Droplets className="w-6 h-6" />}
            color="gradient-blue"
          />
        </div>

        {/* Nutrition breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            title="Белки"
            value={todayData.proteins.current}
            target={todayData.proteins.target}
            unit="г"
            icon={<div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-orange-500 font-bold">Б</div>}
            color="bg-orange-400"
          />
          
          <MetricCard
            title="Жиры"
            value={todayData.fats.current}
            target={todayData.fats.target}
            unit="г"
            icon={<div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-yellow-500 font-bold">Ж</div>}
            color="bg-yellow-400"
          />
          
          <MetricCard
            title="Углеводы"
            value={todayData.carbs.current}
            target={todayData.carbs.target}
            unit="г"
            icon={<div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-green-500 font-bold">У</div>}
            color="bg-green-400"
          />
        </div>

        {/* Other metrics */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Текущий вес"
            value={todayData.weight}
            unit="кг"
            icon={<Weight className="w-6 h-6" />}
            color="gradient-green"
          />
          
          <MetricCard
            title="Активность"
            value={todayData.steps}
            unit="шагов"
            icon={<Activity className="w-6 h-6" />}
            color="gradient-purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-primary" />
            Быстрые действия
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            <QuickActionButton
              icon={<Apple className="w-6 h-6" />}
              label="Добавить еду"
              onClick={() => console.log('Add food')}
            />
            
            <QuickActionButton
              icon={<Droplets className="w-6 h-6" />}
              label="Выпить воды"
              onClick={() => console.log('Add water')}
            />
            
            <QuickActionButton
              icon={<Weight className="w-6 h-6" />}
              label="Взвеситься"
              onClick={() => console.log('Add weight')}
            />
            
            <QuickActionButton
              icon={<FileText className="w-6 h-6" />}
              label="Загрузить анализы"
              onClick={() => console.log('Upload analysis')}
            />
            
            <QuickActionButton
              icon={<Target className="w-6 h-6" />}
              label="Мои цели"
              onClick={() => console.log('Goals')}
            />
            
            <QuickActionButton
              icon={<Calendar className="w-6 h-6" />}
              label="История"
              onClick={() => console.log('History')}
            />
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Прогресс за неделю
          </h3>
          
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <TrendingUp className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500 text-sm">
              Начните отслеживать питание и вес,<br />
              чтобы увидеть свой прогресс
            </p>
          </div>
        </div>

        {/* AI Coach suggestion */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-white/20 rounded-xl flex-shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold mb-2">Совет от ДаЕда</h4>
              <p className="text-sm opacity-90 leading-relaxed">
                Отличная работа! Вы почти достигли цели по калориям сегодня. 
                Рекомендую добавить немного белка в следующий прием пищи. 
                Попробуйте греческий йогурт с орехами! 🥜
              </p>
            </div>
          </div>
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-8" />
      </div>
    </div>
  )
} 