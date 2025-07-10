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

// Мок данные для демонстрации
const mockData = {
  user: {
    name: 'Анна',
    age: 28,
    currentWeight: 65,
    targetWeight: 60,
    height: 165
  },
  today: {
    calories: { current: 1450, target: 1800 },
    proteins: { current: 85, target: 120 },
    fats: { current: 45, target: 60 },
    carbs: { current: 150, target: 200 },
    water: { current: 1200, target: 2000 },
    weight: 64.8,
    steps: 8420,
    sleep: 7.5
  },
  weeklyProgress: [
    { date: '2024-01-15', calories: 1600, weight: 65.2 },
    { date: '2024-01-16', calories: 1750, weight: 65.0 },
    { date: '2024-01-17', calories: 1580, weight: 64.9 },
    { date: '2024-01-18', calories: 1620, weight: 64.8 },
    { date: '2024-01-19', calories: 1450, weight: 64.8 },
  ]
}

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

function ProgressChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-primary" />
        Прогресс за неделю
      </h3>
      
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {new Date(item.date).toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Apple className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm font-medium">{item.calories}</span>
              </div>
              <div className="flex items-center">
                <Weight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium">{item.weight} кг</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
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
    // Проверяем авторизацию и онбординг пользователя
    const checkUserStatus = async () => {
      try {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp
          tg.ready()
          
          const telegramUser = tg.initDataUnsafe?.user
          if (!telegramUser?.id) {
            // Если нет данных Telegram, показываем заглушку
            setLoading(false)
            return
          }

          // Проверяем профиль пользователя
          const response = await fetch('/api/users/profile', {
            headers: {
              'x-telegram-user-id': telegramUser.id.toString()
            }
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data.is_onboarded) {
              setUser(data.data)
            } else {
              // Пользователь не прошел онбординг
              router.push('/onboarding')
              return
            }
          } else {
            // Пользователь не найден, перенаправляем на онбординг
            router.push('/onboarding')
            return
          }
        }
      } catch (error) {
        console.error('Ошибка проверки пользователя:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUserStatus()
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
            value={mockData.today.calories.current}
            target={mockData.today.calories.target}
            unit="ккал"
            icon={<Apple className="w-6 h-6" />}
            color="gradient-orange"
            trend={{ value: 12, isPositive: true }}
          />
          
          <MetricCard
            title="Вода"
            value={mockData.today.water.current}
            target={mockData.today.water.target}
            unit="мл"
            icon={<Droplets className="w-6 h-6" />}
            color="gradient-blue"
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Nutrition breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            title="Белки"
            value={mockData.today.proteins.current}
            target={mockData.today.proteins.target}
            unit="г"
            icon={<div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-orange-500 font-bold">Б</div>}
            color="bg-orange-400"
          />
          
          <MetricCard
            title="Жиры"
            value={mockData.today.fats.current}
            target={mockData.today.fats.target}
            unit="г"
            icon={<div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-yellow-500 font-bold">Ж</div>}
            color="bg-yellow-400"
          />
          
          <MetricCard
            title="Углеводы"
            value={mockData.today.carbs.current}
            target={mockData.today.carbs.target}
            unit="г"
            icon={<div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-green-500 font-bold">У</div>}
            color="bg-green-400"
          />
        </div>

        {/* Other metrics */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Вес"
            value={mockData.today.weight}
            unit="кг"
            icon={<Weight className="w-6 h-6" />}
            color="gradient-green"
            trend={{ value: 2, isPositive: true }}
          />
          
          <MetricCard
            title="Активность"
            value={mockData.today.steps}
            unit="шагов"
            icon={<Activity className="w-6 h-6" />}
            color="gradient-purple"
            trend={{ value: 15, isPositive: true }}
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
        <ProgressChart data={mockData.weeklyProgress} />

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