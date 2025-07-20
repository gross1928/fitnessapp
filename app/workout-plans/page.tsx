'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity, 
  Dumbbell, 
  Clock, 
  Target, 
  TrendingUp, 
  Heart,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Loader2,
  Play,
  Pause,
  Timer
} from 'lucide-react';

interface WorkoutPreferences {
  goals: 'lose_weight' | 'gain_muscle' | 'improve_strength' | 'endurance' | 'flexibility';
  experience: 'beginner' | 'intermediate' | 'advanced';
  availableDays: number[];
  sessionDuration: 'short' | 'medium' | 'long';
  equipment: string[];
  injuries: string[];
  fitnessLevel: number;
  preferredExercises: string[];
}

interface WorkoutPlan {
  id: string;
  goal: string;
  duration: number;
  workouts: {
    day: number;
    name: string;
    type: string;
    duration: number;
    difficulty: string;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      rest: number;
      description: string;
      muscleGroups: string[];
      equipment: string[];
      tips: string[];
    }[];
    warmup: string[];
    cooldown: string[];
  }[];
  tips: string[];
  equipment: string[];
}

export default function WorkoutPlansPage() {
  const [step, setStep] = useState<'onboarding' | 'generating' | 'plan'>('onboarding');
  const [preferences, setPreferences] = useState<WorkoutPreferences>({
    goals: 'improve_strength',
    experience: 'beginner',
    availableDays: [1, 3, 5],
    sessionDuration: 'medium',
    equipment: [],
    injuries: [],
    fitnessLevel: 5,
    preferredExercises: []
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);

  const questions = [
    {
      id: 'experience',
      title: 'Какой у вас опыт тренировок?',
      type: 'select',
      options: [
        { value: 'beginner', label: 'Новичок (0-6 месяцев)', icon: Target },
        { value: 'intermediate', label: 'Средний (6 месяцев - 2 года)', icon: Target },
        { value: 'advanced', label: 'Продвинутый (2+ года)', icon: Target }
      ]
    },
    {
      id: 'availableDays',
      title: 'В какие дни недели можете тренироваться?',
      type: 'multi-select',
      options: [
        { value: 1, label: 'Понедельник' },
        { value: 2, label: 'Вторник' },
        { value: 3, label: 'Среда' },
        { value: 4, label: 'Четверг' },
        { value: 5, label: 'Пятница' },
        { value: 6, label: 'Суббота' },
        { value: 7, label: 'Воскресенье' }
      ]
    },
    {
      id: 'sessionDuration',
      title: 'Сколько времени готовы тратить на тренировку?',
      type: 'select',
      options: [
        { value: 'short', label: 'Короткая (30-45 мин)', icon: Clock },
        { value: 'medium', label: 'Средняя (45-60 мин)', icon: Clock },
        { value: 'long', label: 'Длинная (60+ мин)', icon: Clock }
      ]
    },
    {
      id: 'equipment',
      title: 'Какое оборудование у вас есть?',
      type: 'multi-select',
      options: [
        'Гантели', 'Штанга', 'Турник', 'Брусья', 'Скамья', 'Резинки', 'Коврик', 'Только вес тела'
      ]
    },
    {
      id: 'injuries',
      title: 'Есть ли травмы или ограничения?',
      type: 'multi-select',
      options: [
        'Спина', 'Колени', 'Плечи', 'Локти', 'Запястья', 'Шея', 'Нет травм'
      ]
    },
    {
      id: 'fitnessLevel',
      title: 'Оцените свой уровень физической подготовки (1-10)',
      type: 'slider',
      min: 1,
      max: 10
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
      
      // Для select и slider вопросов переходим к следующему
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        generatePlan();
      }
    }
  };

  const handleContinue = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      generatePlan();
    }
  };

  const generatePlan = async () => {
    setStep('generating');
    
    try {
      // Сохраняем предпочтения в базу данных
      const saveResponse = await fetch('/api/plans/preferences', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-telegram-user-id': window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || ''
        },
        body: JSON.stringify({
          planType: 'workout',
          preferences
        })
      });

      if (!saveResponse.ok) {
        console.warn('⚠️ Не удалось сохранить предпочтения:', await saveResponse.text());
      }

      // Генерируем план
      const response = await fetch('/api/workout-plans/generate', {
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
      // Демо-план
      setPlan({
        id: 'demo',
        goal: 'Улучшение силы',
        duration: 8,
        workouts: [
          {
            day: 1,
            name: 'Тренировка груди и трицепса',
            type: 'Силовая',
            duration: 45,
            difficulty: 'Средняя',
            exercises: [
              {
                name: 'Отжимания',
                sets: 3,
                reps: '10-15',
                rest: 60,
                description: 'Классические отжимания от пола',
                muscleGroups: ['Грудь', 'Трицепс'],
                equipment: ['Вес тела'],
                tips: ['Держите корпус прямым', 'Опускайтесь до касания грудью пола']
              }
            ],
            warmup: ['Легкая разминка 5 минут', 'Растяжка мышц груди'],
            cooldown: ['Растяжка 5 минут', 'Восстановление дыхания']
          }
        ],
        tips: ['Разминайтесь перед каждой тренировкой', 'Следите за техникой', 'Не пропускайте тренировки'],
        equipment: ['Гантели', 'Коврик']
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">План тренировок</h1>
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
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300" 
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
                  {question.options?.map((option, index) => {
                    const optionValue = typeof option === 'string' ? option : option.value;
                    const optionLabel = typeof option === 'string' ? option : option.label;
                    const optionIcon = typeof option === 'object' && 'icon' in option ? option.icon : null;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(optionValue)}
                        className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center">
                          {optionIcon && React.createElement(optionIcon, { className: "w-5 h-5 mr-3 text-blue-600" })}
                          <span className="font-medium">{optionLabel}</span>
                          <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : question.type === 'slider' ? (
                <div className="space-y-4">
                  <input
                    type="range"
                    min={question.min}
                    max={question.max}
                    value={preferences.fitnessLevel}
                    onChange={(e) => setPreferences(prev => ({ ...prev, fitnessLevel: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>1 - Новичок</span>
                    <span className="font-bold text-blue-600">{preferences.fitnessLevel}</span>
                    <span>10 - Профессионал</span>
                  </div>
                  <Button 
                    onClick={() => handleAnswer(preferences.fitnessLevel)}
                    className="w-full"
                  >
                    Продолжить
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {question.options?.map((option, index) => {
                    const optionValue = typeof option === 'string' ? option : option.value;
                    const optionLabel = typeof option === 'string' ? option : option.label;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          const current = preferences[question.id as keyof WorkoutPreferences] as any[];
                          const newValue = current.includes(optionValue) 
                            ? current.filter(item => item !== optionValue)
                            : [...current, optionValue];
                          setPreferences(prev => ({
                            ...prev,
                            [question.id]: newValue
                          }));
                        }}
                        className={`w-full p-4 text-left border rounded-xl transition-all duration-200 ${
                          (preferences[question.id as keyof WorkoutPreferences] as any[])?.includes(optionValue)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <CheckCircle className={`w-5 h-5 mr-3 ${
                            (preferences[question.id as keyof WorkoutPreferences] as any[])?.includes(optionValue)
                              ? 'text-blue-600'
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
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Генерируем ваш план тренировок</h2>
          <p className="text-gray-600">ИИ создает персональную программу тренировок...</p>
        </div>
      </div>
    );
  }

  if (step === 'plan' && plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white">
            <Activity className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Ваш план тренировок</h1>
            <p className="text-blue-100">Персональная программа на основе ваших целей</p>
            <div className="mt-4 flex justify-center space-x-4 text-sm">
              <div className="bg-white/20 rounded-lg px-3 py-1">
                <span className="font-semibold">{plan.duration} недель</span>
              </div>
              <div className="bg-white/20 rounded-lg px-3 py-1">
                <span className="font-semibold">{plan.goal}</span>
              </div>
            </div>
          </div>

          {/* Plan Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Workouts */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Dumbbell className="w-5 h-5 mr-2" />
                    Программа тренировок
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {plan.workouts.map((workout, index) => (
                    <div key={index} className="mb-8">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{getDayName(workout.day)}</h3>
                            <h4 className="text-lg font-semibold text-blue-600">{workout.name}</h4>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-blue-600">{workout.duration} мин</div>
                            <div className="text-xs text-gray-500">{workout.difficulty}</div>
                          </div>
                        </div>

                        {/* Warmup */}
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
                            <Play className="w-4 h-4 mr-2 text-green-600" />
                            Разминка
                          </h5>
                          <ul className="space-y-1">
                            {workout.warmup.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-600">• {item}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Exercises */}
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-700 mb-3">Упражнения</h5>
                          <div className="space-y-3">
                            {workout.exercises.map((exercise, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-4 border border-blue-100">
                                <div className="flex justify-between items-start mb-2">
                                  <h6 className="font-bold text-gray-800">{exercise.name}</h6>
                                  <div className="text-right text-sm">
                                    <div className="font-semibold text-blue-600">{exercise.sets} x {exercise.reps}</div>
                                    <div className="text-gray-500">Отдых: {exercise.rest}с</div>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                                <div className="flex flex-wrap gap-2">
                                  {exercise.muscleGroups.map((muscle, muscleIdx) => (
                                    <span key={muscleIdx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                      {muscle}
                                    </span>
                                  ))}
                                </div>

                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Cooldown */}
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
                            <Pause className="w-4 h-4 mr-2 text-red-600" />
                            Заминка
                          </h5>
                          <ul className="space-y-1">
                            {workout.cooldown.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-600">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Equipment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Dumbbell className="w-5 h-5 mr-2" />
                    Необходимое оборудование
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.equipment.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
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