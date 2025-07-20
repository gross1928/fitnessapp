'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Apple, 
  Utensils, 
  Clock, 
  Target, 
  TrendingUp, 
  Heart,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface NutritionPreferences {
  allergies: string[];
  dislikes: string[];
  likes: string[];
  budget: 'low' | 'medium' | 'high';
  cookingTime: 'quick' | 'medium' | 'elaborate';
  mealsPerDay: number;
  dietaryRestrictions: string[];
  goals: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_health';
}

interface NutritionPlan {
  id: string;
  goal: string;
  dailyCalories: number;
  meals: {
    day: number;
    meals: {
      type: string;
      name: string;
      description: string;
      calories: number;
      protein: number;
      fats: number;
      carbs: number;
      ingredients: string[];
      instructions: string[];
      prepTime: number;
      cost: 'low' | 'medium' | 'high';
    }[];
  }[];
  tips: string[];
  shoppingList: string[];
}

export default function NutritionPlansPage() {
  const [step, setStep] = useState<'onboarding' | 'generating' | 'plan'>('onboarding');
  const [preferences, setPreferences] = useState<NutritionPreferences>({
    allergies: [],
    dislikes: [],
    likes: [],
    budget: 'medium',
    cookingTime: 'medium',
    mealsPerDay: 3,
    dietaryRestrictions: [],
    goals: 'maintain'
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);

  const questions = [
    {
      id: 'goals',
      title: 'Какова ваша основная цель?',
      type: 'select',
      options: [
        { value: 'lose_weight', label: 'Похудеть', icon: TrendingUp },
        { value: 'gain_muscle', label: 'Набрать мышечную массу', icon: TrendingUp },
        { value: 'maintain', label: 'Поддерживать текущий вес', icon: Target },
        { value: 'improve_health', label: 'Улучшить здоровье', icon: Heart }
      ]
    },
    {
      id: 'allergies',
      title: 'Есть ли у вас аллергии или непереносимости?',
      type: 'multi-select',
      options: [
        'Глютен', 'Лактоза', 'Орехи', 'Морепродукты', 'Яйца', 'Соя', 'Мед', 'Нет аллергий'
      ]
    },
    {
      id: 'likes',
      title: 'Какие продукты вы любите?',
      type: 'multi-select',
      options: [
        'Мясо', 'Рыба', 'Овощи', 'Фрукты', 'Крупы', 'Молочные продукты', 'Орехи', 'Сладости'
      ]
    },
    {
      id: 'dislikes',
      title: 'Какие продукты не любите?',
      type: 'multi-select',
      options: [
        'Мясо', 'Рыба', 'Овощи', 'Фрукты', 'Крупы', 'Молочные продукты', 'Орехи', 'Сладости'
      ]
    },
    {
      id: 'budget',
      title: 'Какой у вас бюджет на питание?',
      type: 'select',
      options: [
        { value: 'low', label: 'Экономный', icon: DollarSign },
        { value: 'medium', label: 'Средний', icon: DollarSign },
        { value: 'high', label: 'Высокий', icon: DollarSign }
      ]
    },
    {
      id: 'cookingTime',
      title: 'Сколько времени готовы тратить на готовку?',
      type: 'select',
      options: [
        { value: 'quick', label: 'Быстро (до 15 мин)', icon: Clock },
        { value: 'medium', label: 'Средне (15-30 мин)', icon: Clock },
        { value: 'elaborate', label: 'Подробно (30+ мин)', icon: Clock }
      ]
    },
    {
      id: 'mealsPerDay',
      title: 'Сколько приемов пищи в день предпочитаете?',
      type: 'select',
      options: [
        { value: 3, label: '3 раза в день' },
        { value: 4, label: '4 раза в день' },
        { value: 5, label: '5 раз в день' },
        { value: 6, label: '6 раз в день' }
      ]
    }
  ];

  const handleAnswer = (answer: any) => {
    const question = questions[currentQuestion];
    
    if (question.type === 'multi-select') {
      setPreferences(prev => ({
        ...prev,
        [question.id]: answer
      }));
      // Для multi-select не переходим к следующему вопросу автоматически
    } else {
      setPreferences(prev => ({
        ...prev,
        [question.id]: answer
      }));
      
      // Для select вопросов переходим к следующему
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Все вопросы отвечены, генерируем план
        generatePlan();
      }
    }
  };

  const handleContinue = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Все вопросы отвечены, генерируем план
      generatePlan();
    }
  };

  const generatePlan = async () => {
    setStep('generating');
    
    try {
      const response = await fetch('/api/nutrition-plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        const planData = await response.json();
        setPlan(planData);
        setStep('plan');
      } else {
        throw new Error('Ошибка генерации плана');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      // В случае ошибки показываем демо-план
      setPlan({
        id: 'demo',
        goal: 'Поддержание веса',
        dailyCalories: 2000,
        meals: [
          {
            day: 1,
            meals: [
              {
                type: 'Завтрак',
                name: 'Овсянка с ягодами',
                description: 'Питательная овсянка с свежими ягодами и орехами',
                calories: 350,
                protein: 12,
                fats: 8,
                carbs: 55,
                ingredients: ['Овсянка', 'Ягоды', 'Орехи', 'Мед'],
                instructions: ['Сварить овсянку', 'Добавить ягоды и орехи', 'Полить медом'],
                prepTime: 10,
                cost: 'low'
              }
            ]
          }
        ],
        tips: ['Пейте больше воды', 'Ешьте медленно', 'Не пропускайте приемы пищи'],
        shoppingList: ['Овсянка', 'Ягоды', 'Орехи', 'Мед']
      });
      setStep('plan');
    }
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    return days[dayNumber - 1];
  };

  if (step === 'onboarding') {
    const question = questions[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 p-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Apple className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">План питания</h1>
            <p className="text-gray-600">Ответьте на несколько вопросов для создания персонального плана</p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Вопрос {currentQuestion + 1} из {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{question.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {question.type === 'select' ? (
                <div className="space-y-3">
                  {question.options.map((option, index) => {
                    const optionValue = typeof option === 'string' ? option : option.value;
                    const optionLabel = typeof option === 'string' ? option : option.label;
                    const optionIcon = typeof option === 'object' && 'icon' in option ? option.icon : null;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(optionValue)}
                        className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center">
                          {optionIcon && React.createElement(optionIcon, { className: "w-5 h-5 mr-3 text-orange-600" })}
                          <span className="font-medium">{optionLabel}</span>
                          <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-orange-600 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {question.options?.map((option, index) => {
                    const optionValue = typeof option === 'string' ? option : String(option.value);
                    const optionLabel = typeof option === 'string' ? option : option.label;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          const current = preferences[question.id as keyof NutritionPreferences] as string[];
                          const newValue = current.includes(optionValue) 
                            ? current.filter(item => item !== optionValue)
                            : [...current, optionValue];
                          setPreferences(prev => ({
                            ...prev,
                            [question.id]: newValue
                          }));
                        }}
                        className={`w-full p-4 text-left border rounded-xl transition-all duration-200 ${
                          (preferences[question.id as keyof NutritionPreferences] as string[])?.includes(optionValue)
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <CheckCircle className={`w-5 h-5 mr-3 ${
                            (preferences[question.id as keyof NutritionPreferences] as string[])?.includes(optionValue)
                              ? 'text-orange-600'
                              : 'text-gray-400'
                          }`} />
                          <span className="font-medium">{optionLabel}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              
              {/* Кнопка "Продолжить" для multi-select вопросов */}
              {question.type === 'multi-select' && (
                <div className="mt-6">
                  <Button 
                    onClick={handleContinue}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    Продолжить
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Генерируем ваш план питания</h2>
          <p className="text-gray-600">ИИ анализирует ваши предпочтения и создает персональный план...</p>
        </div>
      </div>
    );
  }

  if (step === 'plan' && plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-white">
            <Apple className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Ваш план питания</h1>
            <p className="text-orange-100">Персональный план на основе ваших предпочтений</p>
            <div className="mt-4 flex justify-center space-x-4 text-sm">
              <div className="bg-white/20 rounded-lg px-3 py-1">
                <span className="font-semibold">{plan.dailyCalories} ккал/день</span>
              </div>
              <div className="bg-white/20 rounded-lg px-3 py-1">
                <span className="font-semibold">{plan.goal}</span>
              </div>
            </div>
          </div>

          {/* Plan Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Meals */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Utensils className="w-5 h-5 mr-2" />
                    План питания на неделю
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {plan.meals.map((day) => (
                    <div key={day.day} className="mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">{getDayName(day.day)}</h3>
                      <div className="space-y-4">
                        {day.meals.map((meal, index) => (
                          <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-bold text-lg text-gray-800">{meal.type}</h4>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-orange-600">{meal.calories} ккал</div>
                                <div className="text-xs text-gray-500">
                                  Б: {meal.protein}г | Ж: {meal.fats}г | У: {meal.carbs}г
                                </div>
                              </div>
                            </div>
                            <h5 className="font-semibold text-gray-800 mb-2">{meal.name}</h5>
                            <p className="text-gray-600 text-sm mb-3">{meal.description}</p>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-semibold text-gray-700">Ингредиенты:</span>
                                <ul className="mt-1 space-y-1">
                                  {meal.ingredients.map((ingredient, idx) => (
                                    <li key={idx} className="text-gray-600">• {ingredient}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">Приготовление:</span>
                                <ul className="mt-1 space-y-1">
                                  {meal.instructions.map((instruction, idx) => (
                                    <li key={idx} className="text-gray-600">• {instruction}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-orange-200">
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-1" />
                                {meal.prepTime} мин
                              </div>
                              <div className="flex items-center text-sm">
                                <DollarSign className={`w-4 h-4 mr-1 ${
                                  meal.cost === 'low' ? 'text-green-600' : 
                                  meal.cost === 'medium' ? 'text-yellow-600' : 'text-red-600'
                                }`} />
                                <span className={
                                  meal.cost === 'low' ? 'text-green-600' : 
                                  meal.cost === 'medium' ? 'text-yellow-600' : 'text-red-600'
                                }>
                                  {meal.cost === 'low' ? 'Экономно' : 
                                   meal.cost === 'medium' ? 'Средне' : 'Дорого'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Советы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Shopping List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Список покупок
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.shoppingList.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Действия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    Сохранить план
                  </Button>
                  <Button className="w-full" variant="outline">
                    Поделиться
                  </Button>
                  <Button className="w-full" variant="outline">
                    Создать новый план
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 