'use client'

import React, { useState, useRef, useEffect } from 'react'
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
import AnalysisModal from '@/components/nutrition/AnalysisModal';
import { NutritionData } from '@/types'; 

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
  const [todayHistory, setTodayHistory] = useState<FoodEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  // Состояния для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<NutritionData | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null); // Новое состояние для ошибки
  const [uploadProgress, setUploadProgress] = useState(0);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadTodayHistory()
    loadWaterIntake()
  }, [])

  const loadTodayHistory = async () => {
    try {
      const telegramUser = typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user;
      
      if (!telegramUser) {
        setHistoryLoading(false);
        return;
      }

      const response = await fetch('/api/nutrition/history', {
        headers: {
          'x-telegram-user-id': telegramUser.id.toString()
        }
      })

      const result = await response.json()

      if (result.success) {
        setTodayHistory(result.data.entries)
      } else {
        console.error('Ошибка загрузки истории:', result.error)
      }
    } catch (error) {
      console.error('Ошибка загрузки истории:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const loadWaterIntake = async () => {
    try {
      const telegramUser = typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user;
      
      if (!telegramUser) return;
      
      const response = await fetch('/api/nutrition/water', {
        headers: {
          'x-telegram-user-id': telegramUser.id.toString()
        }
      })

      const result = await response.json()

      if (result.success) {
        setWaterIntake(result.data.totalToday)
      } else {
        console.error('Ошибка загрузки воды:', result.error)
      }
    } catch (error) {
      console.error('Ошибка загрузки воды:', error)
    }
  }

  // Функция для сохранения анализа
  const handleSaveMeal = async (data: NutritionData) => {
    try {
      const telegramUser = typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user;
      
      if (!telegramUser) {
        throw new Error("Пользователь Telegram не определен.");
      }

      const totalWeight = Array.isArray(data.ingredients) 
        ? data.ingredients.reduce((sum, ing) => sum + ing.weight_grams, 0)
        : 100;

      const response = await fetch('/api/nutrition/save-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-user-id': telegramUser.id.toString(),
        },
        body: JSON.stringify({
          food_name: data.dish_name,
          calories: data.total_nutrition.calories,
          proteins: data.total_nutrition.proteins,
          fats: data.total_nutrition.fats,
          carbs: data.total_nutrition.carbs,
          amount: totalWeight,
          raw_analysis: data,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Прием пищи успешно сохранен');
        loadTodayHistory(); // Обновляем историю
        
        // Показываем уведомление об успехе
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          window.Telegram.WebApp.showAlert('✅ Прием пищи сохранен!');
        }
      } else {
        throw new Error(result.error || 'Ошибка сохранения');
      }
    } catch (error) {
      console.error('Ошибка сохранения приема пищи:', error);
      
      // Показываем ошибку
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        window.Telegram.WebApp.showAlert('❌ Ошибка сохранения. Попробуйте еще раз.');
      }
    }
  };

  // Функция для отправки комментария в чат
  const handleSendFeedback = async (data: NutritionData, feedback: string) => {
    // Формируем подробный запрос для повторного анализа
    const message = `Проанализируй еще раз это блюдо с учетом моих уточнений:
    
    Блюдо: ${data.dish_name}
    
    Текущий анализ:
    - Калории: ${data.total_nutrition.calories} ккал
    - Белки: ${data.total_nutrition.proteins} г
    - Жиры: ${data.total_nutrition.fats} г
    - Углеводы: ${data.total_nutrition.carbs} г
    
    Мои уточнения: ${feedback}
    
    Пересчитай КБЖУ с учетом этих дополнений.`;

    // Вызываем функцию анализа текста с новым запросом
    await analyzeTextInput(message);
  };

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

  const analyzeFoodPhoto = async (file: File) => {
    setIsModalOpen(true);
    setLoading('gallery');
    setAnalysisResult(null);
    setAnalysisError(null); // Сбрасываем предыдущую ошибку

    // Симуляция прогресса загрузки
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 95) {
        progress = 95; // Оставляем немного до завершения
      }
      setUploadProgress(Math.round(progress));
    }, 200);

    try {
      const formData = new FormData()
      formData.append('food_photo', file)

      const telegramUser = typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user;
      
      if (!telegramUser) {
        throw new Error("Пользователь Telegram не определен.");
      }
      
      const response = await fetch('/api/nutrition/analyze-food', {
        method: 'POST',
        headers: {
          'x-telegram-user-id': telegramUser.id.toString()
        },
        body: formData
      })

      const result = await response.json()
      
      clearInterval(interval);
      setUploadProgress(100);

      if (result.success) {
        const analysis: NutritionData = result.data.analysis;
        setAnalysisResult(analysis);
        // Убираем автоматическое сохранение - теперь пользователь выбирает сам
      } else {
        throw new Error(result.error || 'Неизвестная ошибка анализа')
      }
    } catch (error) {
      console.error('Ошибка анализа фото:', error)
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка. Попробуйте еще раз.';
      setAnalysisError(errorMessage); // Устанавливаем сообщение об ошибке
      
      // Не закрываем окно, чтобы показать ошибку
      // setIsModalOpen(false); 
    } finally {
       clearInterval(interval);
       setUploadProgress(100); // Убедимся, что прогресс дошел до конца
       setTimeout(() => setLoading(null), 500); // Небольшая задержка перед скрытием лоадера
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setLoading(null)
      return
    }
    await analyzeFoodPhoto(file)
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
    setIsModalOpen(true);
    setLoading('text');
    setAnalysisResult(null);
    setAnalysisError(null); // Сбрасываем предыдущую ошибку

    // Симуляция прогресса для текстового анализа
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 95) {
        progress = 95;
      }
      setUploadProgress(Math.round(progress));
    }, 150);

    try {
      const telegramUser = typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user;
      
      if (!telegramUser) {
        throw new Error("Пользователь Telegram не определен.");
      }
      
      const response = await fetch('/api/nutrition/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-user-id': telegramUser.id.toString()
        },
        body: JSON.stringify({ foodDescription: description })
      })

      const result = await response.json()
      
      clearInterval(interval);
      setUploadProgress(100);

      if (result.success) {
        const analysis: NutritionData = result.data.analysis;
        setAnalysisResult(analysis);
        // Убираем автоматическое сохранение - теперь пользователь выбирает сам
      } else {
        throw new Error(result.error || 'Неизвестная ошибка анализа');
      }
    } catch (error) {
      console.error('Ошибка анализа текста:', error);
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка. Попробуйте еще раз.';
      setAnalysisError(errorMessage); // Устанавливаем сообщение об ошибке
    } finally {
      setLoading(null);
    }
  };

  const handleBarcodeScanner = () => {
    setLoading('scan')
    
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;

    if (tg) {
      tg.HapticFeedback.impactOccurred('medium')
      
      if (tg.isVersionAtLeast('6.4')) {
        tg.showScanQrPopup({
          text: "Наведите камеру на штрих-код"
        }, (text) => {
          if(text) {
            tg.showAlert(`Отсканировано: ${text}`)
            // Здесь будет логика обработки штрих-кода
            setLoading(null) // ИСПРАВЛЕНИЕ: сброс загрузки
            return true 
          }
          setLoading(null) // Сброс загрузки при закрытии
          return false
        })
      } else {
        tg.showAlert('Функция сканера штрих-кодов недоступна. Обновите Telegram.')
        setLoading(null)
      }
    } else {
      alert('Сканер штрих-кодов доступен только в приложении Telegram')
      setLoading(null)
    }
  }

  const handleAddWater = async (amount: number) => {
    const telegramUser = typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user;
    
    if (!telegramUser) {
      alert('Пользователь не определен. Пожалуйста, перезапустите приложение.');
      return;
    }
    
    // Haptic feedback
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }

    try {
      const response = await fetch('/api/nutrition/water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-user-id': telegramUser.id.toString()
        },
        body: JSON.stringify({ amount })
      })

      const result = await response.json()

      if (result.success) {
        const newTotal = waterIntake + amount
        setWaterIntake(newTotal)
      }
    } catch (error) {
      console.error('Ошибка добавления воды:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 font-sans flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Добавить приём пищи</h1>
        <div className="w-10"></div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        {/* Input Options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            disabled={!!loading}
            onClick={handleCameraPhoto} 
            className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <Camera className="w-10 h-10 mb-2 text-orange-500" />
            <span className="font-semibold">Камера</span>
          </button>
          
          <button 
            disabled={!!loading}
            onClick={handleGalleryPhoto}
            className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <Image className="w-10 h-10 mb-2 text-orange-500" />
            <span className="font-semibold">Галерея</span>
          </button>
          
          <button 
            disabled={!!loading}
            onClick={handleManualInput}
            className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <Keyboard className="w-10 h-10 mb-2 text-orange-500" />
            <span className="font-semibold">Вручную</span>
          </button>

          <button 
            disabled={!!loading}
            onClick={handleBarcodeScanner}
            className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <ScanLine className="w-10 h-10 mb-2 text-orange-500" />
            <span className="font-semibold">Штрих-код</span>
          </button>
        </div>

        {/* Water Intake */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg flex items-center">
              <Droplets className="w-6 h-6 mr-2 text-blue-500" />
              Вода
            </h2>
            <span className="font-bold text-lg text-blue-500">{waterIntake} мл</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[100, 250, 500, 750].map(amount => (
              <button 
                key={amount}
                onClick={() => handleAddWater(amount)}
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold py-2 rounded-lg flex items-center justify-center"
              >
                <Plus size={16} className="mr-1" />
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Today's History */}
        <div>
          <h2 className="font-bold text-lg mb-2 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-gray-500"/>
            Сегодняшняя история
          </h2>
          {historyLoading ? (
            <div className="text-center p-4">Загрузка...</div>
          ) : todayHistory.length > 0 ? (
            <div className="space-y-2">
              {todayHistory.map((entry) => (
                <div key={entry.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{entry.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{entry.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-500">{entry.calories} ккал</p>
                    <div className="flex space-x-2 text-xs">
                      <span title="Белки">Б: {entry.protein}г</span>
                      <span title="Жиры">Ж: {entry.fat}г</span>
                      <span title="Углеводы">У: {entry.carbs}г</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
              <Utensils className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p>Вы еще ничего не ели сегодня.</p>
              <p className="text-sm text-gray-500">Добавьте данные о приемах пищи</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Модальное окно */}
      <AnalysisModal
        isOpen={isModalOpen}
        isLoading={loading === 'gallery' || loading === 'text'}
        analysisResult={analysisResult}
        analysisError={analysisError}
        onClose={() => {
          setIsModalOpen(false)
          setAnalysisResult(null)
          setAnalysisError(null)
        }}
        uploadProgress={uploadProgress}
        onSave={handleSaveMeal}
        onSendFeedback={handleSendFeedback}
      />
    </div>
  )
} 