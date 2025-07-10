'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { User, Scale, Target, Calendar, Ruler, Heart } from 'lucide-react'

interface OnboardingData {
  name: string
  age: number | null
  height: number | null
  gender: 'male' | 'female' | null
  currentWeight: number | null
  targetWeight: number | null
  timeframe: number | null // weeks
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
  goal: 'lose' | 'gain' | 'maintain' | null
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [telegramUser, setTelegramUser] = useState<any>(null)
  const [data, setData] = useState<OnboardingData>({
    name: '',
    age: null,
    height: null,
    gender: null,
    currentWeight: null,
    targetWeight: null,
    timeframe: null,
    activityLevel: null,
    goal: null
  })

  const totalSteps = 6

  useEffect(() => {
    // Получаем данные пользователя из Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      setTelegramUser(tg.initDataUnsafe?.user)
      
      if (tg.initDataUnsafe?.user?.first_name) {
        setData(prev => ({
          ...prev,
          name: `${tg.initDataUnsafe.user.first_name} ${tg.initDataUnsafe.user.last_name || ''}`.trim()
        }))
      }
    }
  }, [])

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      if (!telegramUser?.id) {
        alert('Ошибка: данные Telegram не найдены')
        return
      }

      const response = await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-user-id': telegramUser.id.toString()
        },
        body: JSON.stringify({
          telegram_id: telegramUser.id,
          telegram_username: telegramUser.username,
          name: data.name,
          age: data.age,
          height: data.height,
          gender: data.gender,
          current_weight: data.currentWeight,
          target_weight: data.targetWeight,
          goal_timeframe: data.timeframe,
          activity_level: data.activityLevel,
          goal: data.goal
        })
      })

      if (response.ok) {
        router.push('/')
      } else {
        alert('Ошибка сохранения данных')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка отправки данных')
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return data.name.length > 0
      case 2: return data.age !== null && data.gender !== null
      case 3: return data.height !== null && data.currentWeight !== null
      case 4: return data.goal !== null
      case 5: return data.targetWeight !== null && data.timeframe !== null
      case 6: return data.activityLevel !== null
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Добро пожаловать в ДаЕда! 🏃‍♀️
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Расскажите о себе, чтобы получить персональные рекомендации
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Шаг {step} из {totalSteps}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-6 mb-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <User className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Как вас зовут?</h2>
              </div>
              <input
                type="text"
                placeholder="Введите ваше имя"
                value={data.name}
                onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Heart className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Немного о вас</h2>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Возраст</label>
                <input
                  type="number"
                  placeholder="25"
                  value={data.age || ''}
                  onChange={(e) => setData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Пол</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={data.gender === 'male' ? 'default' : 'outline'}
                    onClick={() => setData(prev => ({ ...prev, gender: 'male' }))}
                    className="p-3"
                  >
                    Мужской
                  </Button>
                  <Button
                    type="button"
                    variant={data.gender === 'female' ? 'default' : 'outline'}
                    onClick={() => setData(prev => ({ ...prev, gender: 'female' }))}
                    className="p-3"
                  >
                    Женский
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Ruler className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Физические данные</h2>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Рост (см)</label>
                <input
                  type="number"
                  placeholder="170"
                  value={data.height || ''}
                  onChange={(e) => setData(prev => ({ ...prev, height: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Текущий вес (кг)</label>
                <input
                  type="number"
                  placeholder="70"
                  value={data.currentWeight || ''}
                  onChange={(e) => setData(prev => ({ ...prev, currentWeight: e.target.value ? parseFloat(e.target.value) : null }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Ваша цель</h2>
              </div>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant={data.goal === 'lose' ? 'default' : 'outline'}
                  onClick={() => setData(prev => ({ ...prev, goal: 'lose' }))}
                  className="w-full p-3 text-left justify-start"
                >
                  📉 Похудеть
                </Button>
                <Button
                  type="button"
                  variant={data.goal === 'gain' ? 'default' : 'outline'}
                  onClick={() => setData(prev => ({ ...prev, goal: 'gain' }))}
                  className="w-full p-3 text-left justify-start"
                >
                  📈 Набрать вес
                </Button>
                <Button
                  type="button"
                  variant={data.goal === 'maintain' ? 'default' : 'outline'}
                  onClick={() => setData(prev => ({ ...prev, goal: 'maintain' }))}
                  className="w-full p-3 text-left justify-start"
                >
                  ⚖️ Поддерживать вес
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Scale className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Детали цели</h2>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Желаемый вес (кг)</label>
                <input
                  type="number"
                  placeholder="65"
                  value={data.targetWeight || ''}
                  onChange={(e) => setData(prev => ({ ...prev, targetWeight: e.target.value ? parseFloat(e.target.value) : null }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">За какое время? (недель)</label>
                <input
                  type="number"
                  placeholder="12"
                  value={data.timeframe || ''}
                  onChange={(e) => setData(prev => ({ ...prev, timeframe: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Уровень активности</h2>
              </div>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant={data.activityLevel === 'sedentary' ? 'default' : 'outline'}
                  onClick={() => setData(prev => ({ ...prev, activityLevel: 'sedentary' }))}
                  className="w-full p-3 text-left justify-start text-sm"
                >
                  🪑 Малоподвижный (офисная работа)
                </Button>
                <Button
                  type="button"
                  variant={data.activityLevel === 'light' ? 'default' : 'outline'}
                  onClick={() => setData(prev => ({ ...prev, activityLevel: 'light' }))}
                  className="w-full p-3 text-left justify-start text-sm"
                >
                  🚶 Легкая активность (1-3 дня в неделю)
                </Button>
                <Button
                  type="button"
                  variant={data.activityLevel === 'moderate' ? 'default' : 'outline'}
                  onClick={() => setData(prev => ({ ...prev, activityLevel: 'moderate' }))}
                  className="w-full p-3 text-left justify-start text-sm"
                >
                  🏃 Умеренная активность (3-5 дней)
                </Button>
                <Button
                  type="button"
                  variant={data.activityLevel === 'active' ? 'default' : 'outline'}
                  onClick={() => setData(prev => ({ ...prev, activityLevel: 'active' }))}
                  className="w-full p-3 text-left justify-start text-sm"
                >
                  💪 Высокая активность (6-7 дней)
                </Button>
                <Button
                  type="button"
                  variant={data.activityLevel === 'very_active' ? 'default' : 'outline'}
                  onClick={() => setData(prev => ({ ...prev, activityLevel: 'very_active' }))}
                  className="w-full p-3 text-left justify-start text-sm"
                >
                  🔥 Очень высокая (2+ раза в день)
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1"
            >
              Назад
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1"
          >
            {step === totalSteps ? 'Завершить' : 'Далее'}
          </Button>
        </div>
      </div>
    </div>
  )
} 