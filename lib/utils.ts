import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, startOfDay, endOfDay, isToday, isThisWeek, isThisMonth } from 'date-fns'
import { ru } from 'date-fns/locale'

// Объединение Tailwind классов
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Форматирование даты
export function formatDate(date: string | Date, formatStr: string = 'dd.MM.yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: ru })
}

// Форматирование времени
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'HH:mm', { locale: ru })
}

// Форматирование даты и времени
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd.MM.yyyy HH:mm', { locale: ru })
}

// Проверка, является ли дата сегодняшней
export function isDateToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isToday(dateObj)
}

// Проверка, является ли дата в этой неделе
export function isDateThisWeek(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isThisWeek(dateObj, { locale: ru })
}

// Проверка, является ли дата в этом месяце
export function isDateThisMonth(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isThisMonth(dateObj)
}

// Получение начала дня
export function getStartOfDay(date: string | Date): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return startOfDay(dateObj)
}

// Получение конца дня
export function getEndOfDay(date: string | Date): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return endOfDay(dateObj)
}

// Конвертация изображения в base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Убираем префикс data:image/...;base64,
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}

// Сжатие изображения
export function compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Рассчитываем новые размеры
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      
      // Рисуем сжатое изображение
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // Конвертируем в blob
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Расчет BMI
export function calculateBMI(weight: number, height: number): number {
  return weight / Math.pow(height / 100, 2)
}

// Категория BMI
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Недостаточный вес'
  if (bmi < 25) return 'Нормальный вес'
  if (bmi < 30) return 'Избыточный вес'
  return 'Ожирение'
}

// Расчет базального метаболизма (BMR)
export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
  }
}

// Расчет TDEE (Total Daily Energy Expenditure)
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  }
  
  return bmr * (multipliers[activityLevel as keyof typeof multipliers] || 1.2)
}

// Форматирование чисел с разделителями
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('ru-RU', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  })
}

// Форматирование калорий
export function formatCalories(calories: number): string {
  return `${formatNumber(calories)} ккал`
}

// Форматирование граммов
export function formatGrams(grams: number): string {
  return `${formatNumber(grams, 1)} г`
}

// Форматирование миллилитров
export function formatMilliliters(ml: number): string {
  return `${formatNumber(ml)} мл`
}

// Форматирование процентов
export function formatPercent(percent: number): string {
  return `${formatNumber(percent, 1)}%`
}

// Получение цвета прогресса
export function getProgressColor(current: number, target: number): string {
  const percentage = (current / target) * 100
  
  if (percentage < 50) return 'text-red-500'
  if (percentage < 80) return 'text-yellow-500'
  if (percentage <= 100) return 'text-green-500'
  return 'text-blue-500'
}

// Получение процента прогресса
export function getProgressPercentage(current: number, target: number): number {
  return Math.min((current / target) * 100, 100)
}

// Генерация случайного ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Дебаунс функция
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Проверка на мобильное устройство
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

// Копирование в буфер обмена
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Ошибка копирования:', error)
    return false
  }
}

// Получение случайного элемента из массива
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// Группировка данных по дате
export function groupByDate<T extends { created_at: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const date = format(parseISO(item.created_at), 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// Сортировка по дате (новые сначала)
export function sortByDateDesc<T extends { created_at: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

// Фильтрация по сегодняшнему дню
export function filterToday<T extends { created_at: string }>(items: T[]): T[] {
  return items.filter(item => isDateToday(item.created_at))
}

// Фильтрация по текущей неделе
export function filterThisWeek<T extends { created_at: string }>(items: T[]): T[] {
  return items.filter(item => isDateThisWeek(item.created_at))
}

// Фильтрация по текущему месяцу
export function filterThisMonth<T extends { created_at: string }>(items: T[]): T[] {
  return items.filter(item => isDateThisMonth(item.created_at))
} 