'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GeneratedPlan, PlanGenerationParams } from '@/types';
import { useUser } from '@supabase/auth-helpers-react';

// Helper to get day name
const getDayName = (dayNumber: number) => {
  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  return days[dayNumber - 1];
};

export default function PlanGeneratorPage() {
  const user = useUser(); // Get user from Supabase
  const [params, setParams] = useState<Partial<PlanGenerationParams>>({
    goal: 'lose_weight',
    experience: 'beginner',
    workout_days: [1, 3, 5],
    food_preferences: 'Без особых предпочтений',
    user_info: { age: 30, sex: 'male', height: 180, weight: 80 },
  });
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedPlan(null);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const response = await fetch('/api/plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Не удалось сгенерировать план.');
      }

      const plan: GeneratedPlan = await response.json();
      setGeneratedPlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan) return;
    if (!user) {
        setSaveError("Не удалось определить пользователя. Пожалуйста, войдите в систему.");
        return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/plans/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: generatedPlan, userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Не удалось сохранить план.');
      }
      
      setSaveSuccess(true);
      setGeneratedPlan(null); // Optionally clear the plan from view after saving

    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка при сохранении.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Генератор планов</CardTitle>
          <CardDescription>
            Заполните ваши данные, чтобы ИИ составил для вас персональный план питания и тренировок.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Здесь будет форма для ввода параметров. Пока используем значения по умолчанию. */}
          <p>В будущем здесь будет детальная форма для ввода параметров. Пока мы используем значения по-умолчанию для демонстрации.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGeneratePlan} disabled={isLoading}>
            {isLoading ? 'Генерация...' : 'Сгенерировать план'}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Card className="mb-8 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Ошибка</CardTitle>
            <CardDescription className="text-destructive">{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {generatedPlan && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Ваш персональный план</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>План питания</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedPlan.nutrition_plan.map((day) => (
                  <div key={day.day_of_week} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{getDayName(day.day_of_week)}</h3>
                    <div className="space-y-3">
                      {day.meals.map((meal) => (
                        <div key={meal.meal_type} className="p-3 bg-muted rounded-md">
                          <p className="font-bold capitalize">{meal.meal_type}</p>
                          <p>{meal.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {meal.calories} ккал | Б: {meal.protein}г | Ж: {meal.fats}г | У: {meal.carbs}г
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>План тренировок</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedPlan.workout_plan.map((day) => (
                  <div key={day.day_of_week} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{getDayName(day.day_of_week)} - {day.description}</h3>
                     <ul className="space-y-2">
                      {day.exercises.map((ex, index) => (
                        <li key={index} className="p-3 bg-muted rounded-md">
                           <p className="font-bold">{ex.name}</p>
                           <p className="text-sm text-muted-foreground">
                             {ex.sets} подхода по {ex.reps} повторений, отдых {ex.rest_seconds} сек.
                           </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 flex justify-end">
            <Button onClick={handleSavePlan} disabled={isSaving}>
              {isSaving ? 'Сохранение...' : 'Сохранить план'}
            </Button>
          </div>
        </div>
      )}

      {saveSuccess && (
        <Card className="mt-8 bg-green-100 dark:bg-green-900/30">
            <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-300">Успех!</CardTitle>
                <CardDescription className="text-green-700 dark:text-green-400">Ваш новый план успешно сохранен в профиле.</CardDescription>
            </CardHeader>
        </Card>
      )}

      {saveError && (
        <Card className="mt-8 bg-destructive/10">
            <CardHeader>
                <CardTitle className="text-destructive">Ошибка сохранения</CardTitle>
                <CardDescription className="text-destructive">{saveError}</CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
} 