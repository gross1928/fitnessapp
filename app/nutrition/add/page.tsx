'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Camera, 
  Image, 
  Keyboard, 
  ScanLine,
  Droplets,
  Plus,
  ArrowLeft,
  Clock,
  Utensils,
  Zap
} from 'lucide-react'

interface FoodEntry {
  id: string
  name: string
  time: string
  calories: number
  protein: number
  fat: number
  carbs: number
}

export default function AddFoodPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [waterIntake, setWaterIntake] = useState(0)
  const [loading, setLoading] = useState<string | null>(null)

  // Моковые данные истории
  const todayHistory: FoodEntry[] = [
    {
      id: '1',
      name: 'Овсянка с бананом',
      time: '08:30',
      calories: 320,
      protein: 12,
      fat: 6,
      carbs: 58
    },
    {
      id: '2', 
      name: 'Куриная грудка с рисом',
      time: '13:15',
      calories: 450,
      protein: 35,
      fat: 8,
      carbs: 52
    }
  ]

  const handleCameraPhoto = async () => {
    setLoading('camera')
    
    try {
      // Telegram WebApp haptic feedback
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
        
        // Проверяем поддержку камеры в Telegram
        if (navigator.mediaDevices) {
          window.Telegram.WebApp.showAlert('Функция камеры скоро будет доступна! 📸')
        } else {
          window.Telegram.WebApp.showAlert('Камера недоступна в этом браузере')
        }
      } else {
        alert('Функция камеры скоро будет доступна! 📸')
      }
    } catch (error) {
      console.error('Camera error:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleGalleryPhoto = () => {
    setLoading('gallery')
    
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }
    
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setLoading(null)
      return
    }

    try {
      // Здесь будет обработка файла с AI анализом
      console.log('Selected file:', file.name)
      
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert(`Анализируем фото: ${file.name}. Функция скоро будет готова! 🤖`)
      } else {
        alert(`Анализируем фото: ${file.name}. Функция скоро будет готова! 🤖`)
      }
    } catch (error) {
      console.error('File processing error:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleManualInput = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
      
      // Показываем prompt для ввода текста
      const foodDescription = prompt('Опишите ваш прием пищи:\nНапример: "Два яйца, тост с маслом, кофе с молоком"')
      
      if (foodDescription && foodDescription.trim().length > 2) {
        analyzeTextInput(foodDescription.trim())
      }
    } else {
      const foodDescription = prompt('Опишите ваш прием пищи:\nНапример: "Два яйца, тост с маслом, кофе с молоком"')
      
      if (foodDescription && foodDescription.trim().length > 2) {
        analyzeTextInput(foodDescription.trim())
      }
    }
  }

  const analyzeTextInput = async (description: string) => {
    try {
      setLoading('text')
      
      const telegramUser = typeof window !== 'undefined' && window.Telegram?.WebApp ? 
        window.Telegram.WebApp.initDataUnsafe?.user : null
      
      const response = await fetch('/api/nutrition/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(telegramUser?.id && { 'x-telegram-user-id': telegramUser.id.toString() })
        },
        body: JSON.stringify({ foodDescription: description })
      })

      const result = await response.json()

      if (result.success) {
        const analysis = result.data.analysis
        const message = `🤖 Анализ: ${analysis.detected_food}\n\n` +
          `📊 Калории: ${analysis.estimated_calories} ккал/100г\n` +
          `🥩 Белки: ${analysis.estimated_nutrition.proteins}г\n` +
          `🧈 Жиры: ${analysis.estimated_nutrition.fats}г\n` +
          `🍞 Углеводы: ${analysis.estimated_nutrition.carbs}г\n\n` +
          `Уверенность: ${analysis.confidence}%`

        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert(message)
        } else {
          alert(message)
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Ошибка анализа текста:', error)
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('Ошибка анализа. Попробуйте еще раз.')
      } else {
        alert('Ошибка анализа. Попробуйте еще раз.')
      }
    } finally {
      setLoading(null)
    }
  }

  const handleBarcodeScanner = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
      window.Telegram.WebApp.showAlert('Сканер штрих-кодов скоро будет доступен! 📱')
    } else {
      alert('Сканер штрих-кодов скоро будет доступен! 📱')
    }
  }

  const handleAddWater = async (amount: number) => {
    try {
      const telegramUser = typeof window !== 'undefined' && window.Telegram?.WebApp ? 
        window.Telegram.WebApp.initDataUnsafe?.user : null
      
      const response = await fetch('/api/nutrition/water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(telegramUser?.id && { 'x-telegram-user-id': telegramUser.id.toString() })
        },
        body: JSON.stringify({ amount })
      })

      const result = await response.json()

      if (result.success) {
        setWaterIntake(result.data.totalToday)
        
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
          window.Telegram.WebApp.showPopup({
            title: '💧 Вода добавлена!',
            message: `+${amount}мл воды. Всего сегодня: ${result.data.totalToday}мл`,
            buttons: [{ type: 'ok', text: 'OK' }]
          })
        } else {
          alert(`+${amount}мл воды добавлено! Всего: ${result.data.totalToday}мл`)
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Ошибка добавления воды:', error)
      
      // Fallback: обновляем локально
      setWaterIntake(prev => prev + amount)
      
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
        window.Telegram.WebApp.showAlert(`Добавлено ${amount}мл воды (локально)`)
      } else {
        alert(`Добавлено ${amount}мл воды (локально)`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 p-4">
      <div className="max-w-lg mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pt-6 pb-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white/80 border border-green-200 hover:bg-green-50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-green-600" />
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800">Добавить еду</h1>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Main Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200/50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-green-600" />
            Способы добавления
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCameraPhoto}
              disabled={loading === 'camera'}
              className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              <Camera className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-medium">Фото с камеры</span>
              {loading === 'camera' && <div className="mt-1 text-xs">Загрузка...</div>}
            </button>
            
            <button
              onClick={handleGalleryPhoto}
              disabled={loading === 'gallery'}
              className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              <Image className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-medium">Из галереи</span>
              {loading === 'gallery' && <div className="mt-1 text-xs">Загрузка...</div>}
            </button>
            
            <button
              onClick={handleManualInput}
              disabled={loading === 'text'}
              className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              <Keyboard className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-medium">Ручной ввод</span>
              {loading === 'text' && <div className="mt-1 text-xs">Анализ...</div>}
            </button>
            
            <button
              onClick={handleBarcodeScanner}
              className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ScanLine className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-medium">Сканер кода</span>
            </button>
          </div>
        </div>

        {/* Water Tracker */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg border border-blue-200/50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Droplets className="w-5 h-5 mr-2 text-blue-600" />
            Трекер воды
          </h2>
          
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-blue-600 mb-1">{waterIntake.toLocaleString()}</div>
            <div className="text-sm text-gray-600">мл сегодня</div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleAddWater(250)}
              className="flex-1 p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              +250мл
            </button>
            
            <button
              onClick={() => handleAddWater(500)}
              className="flex-1 p-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              +500мл
            </button>
          </div>
        </div>

        {/* Today's History */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200/50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-600" />
            История сегодня
          </h2>
          
          {todayHistory.length > 0 ? (
            <div className="space-y-3">
              {todayHistory.map((entry) => (
                <div key={entry.id} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">{entry.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {entry.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{entry.calories}</div>
                      <div className="text-xs text-gray-500">ккал</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <div className="font-medium text-orange-600">{entry.protein}г</div>
                      <div className="text-xs text-gray-600">Белки</div>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <div className="font-medium text-yellow-600">{entry.fat}г</div>
                      <div className="text-xs text-gray-600">Жиры</div>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <div className="font-medium text-green-600">{entry.carbs}г</div>
                      <div className="text-xs text-gray-600">Углеводы</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Сегодня еще ничего не добавлено</p>
            </div>
          )}
        </div>

        {/* Quick Add Shortcuts */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 shadow-lg border border-yellow-200/50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            Быстрое добавление
          </h2>
          
          <div className="grid grid-cols-3 gap-3">
            <button className="p-3 bg-white rounded-lg border border-yellow-200 hover:bg-yellow-50 transition-colors text-center">
              <div className="text-2xl mb-1">☕</div>
              <div className="text-xs text-gray-600">Кофе</div>
            </button>
            
            <button className="p-3 bg-white rounded-lg border border-yellow-200 hover:bg-yellow-50 transition-colors text-center">
              <div className="text-2xl mb-1">🍎</div>
              <div className="text-xs text-gray-600">Яблоко</div>
            </button>
            
            <button className="p-3 bg-white rounded-lg border border-yellow-200 hover:bg-yellow-50 transition-colors text-center">
              <div className="text-2xl mb-1">🥛</div>
              <div className="text-xs text-gray-600">Молоко</div>
            </button>
          </div>
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-8" />
      </div>

      {/* Hidden file input for gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
} 