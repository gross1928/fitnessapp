// Профессиональные программы тренировок
// Используются как основа для создания персонализированных планов

export const USER_WORKOUT_PROGRAMS = {
    powerlifting_and_strength: {
        male: {
            intermediate: {
                title: "Пауэрлифтинг и силовые, мужчина, средняя нагрузка (Неделя 1-7)",
                description: "7-недельная программа, направленная на увеличение силовых показателей в базовых движениях.",
                weeks: [
                    // Week 1
                    {
                        week: 1,
                        days: [
                            { title: "День 1", exercises: [{ name: "Жим лежа", sets_reps: "4x5", weight: "52,5" }, { name: "Гориз.тяга", sets_reps: "3x8-12", weight: "средне" }, { name: "Жим стоя", sets_reps: "3x8", weight: "40" }, { name: "Верт.тяга", sets_reps: "2x8-12", weight: "средне" }, { name: "Трицепс", sets_reps: "2x8-12" }] },
                            { title: "День 2", exercises: [{ name: "Присед", sets_reps: "4x5", weight: "40" }, { name: "Лицевая тяга", sets_reps: "3x8-12", weight: "легко" }, { name: "Ст. тяга", sets_reps: "4x5", weight: "45" }, { name: "Пресс", sets_reps: "3x8-12", weight: "средне" }] },
                            { title: "День 3", exercises: [{ name: "Жим стоя", sets_reps: "4x5", weight: "45" }, { name: "Верт.тяга", sets_reps: "3x8-12", weight: "легко" }, { name: "Гориз.тяга", sets_reps: "2x8-12", weight: "средне" }, { name: "Трицепс", sets_reps: "2x8-12", weight: "легко" }] },
                            { title: "День 4", exercises: [{ name: "Ст. тяга", sets_reps: "4x5", weight: "50" }, { name: "Лицевая тяга", sets_reps: "3x8-12", weight: "легко" }, { name: "Присед", sets_reps: "3x8", weight: "35" }, { name: "Пресс", sets_reps: "2x8-12", weight: "легко" }, { name: "Бицепс", sets_reps: "2x8-12", weight: "легко" }] }
                        ]
                    },
                    // Week 2
                    {
                        week: 2,
                        days: [
                            { title: "День 1", exercises: [{ name: "Жим лежа", sets_reps: "4x5", weight: "55" }, { name: "Гориз.тяга", sets_reps: "3x8-12", weight: "тяжело" }, { name: "Жим стоя", sets_reps: "3x8", weight: "40" }, { name: "Верт.тяга", sets_reps: "2x8-12", weight: "легко" }, { name: "Трицепс", sets_reps: "2x8-12", weight: "тяжело" }] },
                            { title: "День 2", exercises: [{ name: "Присед", sets_reps: "4x5", weight: "42,5" }, { name: "Лицевая тяга", sets_reps: "3x8-12", weight: "легко" }, { name: "Ст. тяга", sets_reps: "4x5", weight: "45" }, { name: "Пресс", sets_reps: "3x8-12", weight: "тяжело" }] },
                            { title: "День 3", exercises: [{ name: "Жим стоя", sets_reps: "4x5", weight: "47,5" }, { name: "Верт.тяга", sets_reps: "3x8-12", weight: "средне" }, { name: "Гориз.тяга", sets_reps: "2x8-12", weight: "легко" }, { name: "Трицепс", sets_reps: "2x8-12", weight: "средне" }] },
                            { title: "День 4", exercises: [{ name: "Ст. тяга", sets_reps: "4x5", weight: "52,5" }, { name: "Лицевая тяга", sets_reps: "3x8-12", weight: "легко" }, { name: "Присед", sets_reps: "3x8", weight: "35" }, { name: "Пресс", sets_reps: "2x8-12", weight: "легко" }, { name: "Бицепс", sets_reps: "2x8-12", weight: "легко" }] }
                        ]
                    }
                ]
            },
            advanced: {
                title: "Пауэрлифтинг и силовые, мужчина, большая нагрузка",
                description: "Программы, разделенные на блоки, с фокусом на интенсивности и вариативности.",
                blocks: [
                    {
                        block: 1,
                        trainings: [
                            { title: "Тренировка 1", exercises: [{ name: "жим ногами", intensity: "средняя", sets_reps: "3x6-8" }, { name: "жим гантелей", intensity: "средняя", sets_reps: "3x8-12" }, { name: "ягодичный мс", intensity: "легкая", sets_reps: "3x6-8" }, { name: "отведения на", intensity: "легкая", sets_reps: "3x12-15" }] },
                            { title: "Тренировка 2", exercises: [{ name: "жим лёжа", intensity: "средняя", sets_reps: "3x8-12" }, { name: "тяга вертикал", intensity: "средняя", sets_reps: "3x8-12" }, { name: "подъем ганте", intensity: "легкая", sets_reps: "3x8-12" }, { name: "французский", intensity: "легкая", sets_reps: "3x8-12" }] }
                        ]
                    }
                ]
            }
        }
    },
    bodybuilding: {
        male: {
            beginner: {
                title: "Бодибилдинг, мужчина, малая нагрузка",
                description: "8-блоковая программа для начинающих, нацеленная на гипертрофию.",
                blocks: [
                    {
                        block: 1,
                        trainings: [
                            { title: "Тренировка 1", exercises: [{ name: "жим ногами с", intensity: "средняя", sets_reps: "3x6-8" }, { name: "жим гантелей", intensity: "средняя", sets_reps: "3x8-12" }, { name: "ягодичный мс", intensity: "легкая", sets_reps: "3x6-8" }, { name: "отведения на", intensity: "легкая", sets_reps: "3x12-15" }] },
                            { title: "Тренировка 2", exercises: [{ name: "жим лёжа", intensity: "средняя", sets_reps: "3x8-12" }, { name: "тяга вертикал", intensity: "средняя", sets_reps: "3x8-12" }, { name: "подъем ганте", intensity: "легкая", sets_reps: "3x8-12" }, { name: "французский", intensity: "легкая", sets_reps: "3x8-12" }] }
                        ]
                    }
                ]
            },
            intermediate: { 
                title: "Бодибилдинг, мужчина, средняя нагрузка",
                description: "Программа на 6 блоков для опытных атлетов.",
                blocks: [
                    {
                        block: 1,
                        trainings: [
                            { title: "Тренировка 1", exercises: [{ name: "жим ногами в упоре в н", intensity: "средняя", sets_reps: "4x6-8" }, { name: "сгибания ног в тренажере", intensity: "легкая", sets_reps: "3x8-12" }, { name: "жим гантелей сидя", intensity: "легкая", sets_reps: "3x8-12" }, { name: "сгибания кисти со штангой", intensity: "легкая", sets_reps: "4x8-12" }, { name: "подъем на носки в смите", intensity: "легкая", sets_reps: "4x12-15" }] },
                            { title: "Тренировка 2", exercises: [{ name: "жим лёжа", intensity: "средняя", sets_reps: "4x8-12" }, { name: "тяга вертикального блока", intensity: "средняя", sets_reps: "3x8-12" }, { name: "французский жим лежа", intensity: "средняя", sets_reps: "3x8-12" }, { name: "подъем гантелей на бицепс", intensity: "легкая", sets_reps: "4x8-12" }, { name: "подъем на носки в смите", intensity: "средняя", sets_reps: "4x12-15" }] }
                        ]
                    }
                ]
            },
            advanced: {
                title: "Бодибилдинг, мужчина, высокая нагрузка",
                description: "8-блоковая программа для максимальной гипертрофии.",
                blocks: [
                    {
                        block: 1,
                        trainings: [
                            { title: "Тренировка 1", exercises: [{ name: "жим ногами в упоре в н", intensity: "средняя", sets_reps: "4x6-8" }, { name: "жим гантелей сидя", intensity: "средняя", sets_reps: "4x8-12" }, { name: "отведения на дельты", intensity: "средняя", sets_reps: "4x8-12" }, { name: "сгибания кисти со штангой", intensity: "средняя", sets_reps: "4x8-12" }] },
                            { title: "Тренировка 2", exercises: [{ name: "жим лёжа", intensity: "средняя", sets_reps: "4x8-12" }, { name: "тяга горизонтального бло", intensity: "средняя", sets_reps: "5x8-12" }, { name: "французский жим лежа", intensity: "средняя", sets_reps: "5x8-12" }, { name: "подъем на бицепс в смите", intensity: "средняя", sets_reps: "5x8-12" }, { name: "молотки", intensity: "средняя", sets_reps: "4x8-12" }] }
                        ]
                    }
                ]
            }
        },
        female: {
            advanced: {
                title: "Бодибилдинг, женщина, высокая нагрузка",
                description: "8-блоковая программа для женщин, нацеленная на построение фигуры.",
                blocks: [
                    {
                        block: 1,
                        trainings: [
                            { title: "Тренировка 1", exercises: [{ name: "жим лёжа", intensity: "средняя", sets_reps: "4x8-12" }, { name: "тяга вертикального блока", intensity: "средняя", sets_reps: "4x8-12" }, { name: "французский жим лежа", intensity: "средняя", sets_reps: "3x8-12" }, { name: "сгибания на бицепс с супинацией", intensity: "средняя", sets_reps: "3x8-12" }, { name: "отведения на дельты", intensity: "средняя", sets_reps: "4x12-15" }] },
                            { title: "Тренировка 2", exercises: [{ name: "ягодичный мост", intensity: "средняя", sets_reps: "4x6-8" }, { name: "присед", intensity: "средняя", sets_reps: "4x6-8" }, { name: "сгибания ног в тренажере", intensity: "средняя", sets_reps: "4x8-12" }, { name: "румынская тяга", intensity: "средняя", sets_reps: "4x8-12" }, { name: "сгибания ног в смите", intensity: "средняя", sets_reps: "4x12-15" }] }
                        ]
                    }
                ]
            }
        }
    }
};

// Функция для получения подходящей программы на основе предпочтений пользователя
export function getBaseProgram(preferences: any) {
    const { goals, experience, fitnessLevel, gender } = preferences;
    
    // Определяем тип программы
    let programType: keyof typeof USER_WORKOUT_PROGRAMS = 'bodybuilding';
    if (goals === 'improve_strength' || goals === 'powerlifting') {
        programType = 'powerlifting_and_strength';
    }
    
    // Определяем уровень сложности
    let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (experience === 'advanced' || fitnessLevel >= 8) {
        difficulty = 'advanced';
    } else if (experience === 'intermediate' || fitnessLevel >= 5) {
        difficulty = 'intermediate';
    }
    
    // Определяем пол
    const genderKey = gender === 'female' ? 'female' : 'male';
    
    // Получаем базовую программу
    const baseProgram = (USER_WORKOUT_PROGRAMS as any)[programType]?.[genderKey]?.[difficulty];
    
    return {
        baseProgram,
        programType,
        difficulty,
        gender: genderKey
    };
}

// Функция для адаптации программы под пользователя
export function adaptProgramToUser(baseProgram: any, preferences: any) {
    if (!baseProgram) return null;
    
    const { availableDays, sessionDuration, equipment, injuries, fitnessLevel } = preferences;
    
    // Адаптируем количество дней тренировок
    let adaptedDays = baseProgram.weeks?.[0]?.days || baseProgram.blocks?.[0]?.trainings || [];
    
    if (availableDays.length < adaptedDays.length) {
        // Если у пользователя меньше дней, объединяем тренировки
        adaptedDays = adaptedDays.slice(0, availableDays.length);
    }
    
    // Адаптируем интенсивность на основе уровня подготовки
    const intensityMultiplier = fitnessLevel / 10; // 0.1 - 1.0
    
    // Адаптируем упражнения под доступное оборудование
    const adaptedExercises = adaptedDays.map((day: any) => ({
        ...day,
        exercises: day.exercises?.map((exercise: any) => {
            // Проверяем доступность оборудования
            const isEquipmentAvailable = checkEquipmentAvailability(exercise.name, equipment);
            
            if (!isEquipmentAvailable) {
                // Заменяем на альтернативное упражнение
                return findAlternativeExercise(exercise, equipment);
            }
            
            // Адаптируем интенсивность
            return adaptExerciseIntensity(exercise, intensityMultiplier, fitnessLevel);
        }).filter(Boolean) || []
    }));
    
    return {
        ...baseProgram,
        adaptedDays: adaptedExercises,
        adaptations: {
            intensityMultiplier,
            availableDays,
            sessionDuration,
            equipment,
            injuries
        }
    };
}

// Вспомогательные функции
function checkEquipmentAvailability(exerciseName: string, availableEquipment: string[]) {
    const exerciseEquipment = getExerciseEquipment(exerciseName);
    return exerciseEquipment.some(equip => availableEquipment.includes(equip));
}

function getExerciseEquipment(exerciseName: string): string[] {
    const equipmentMap: { [key: string]: string[] } = {
        'жим лежа': ['штанга', 'скамья'],
        'присед': ['штанга', 'стойки'],
        'становая тяга': ['штанга'],
        'жим гантелей': ['гантели'],
        'тяга вертикального блока': ['блочный тренажер'],
        'жим ногами': ['тренажер для жима ногами'],
        // Добавьте больше упражнений по необходимости
    };
    
    return equipmentMap[exerciseName.toLowerCase()] || ['гантели', 'собственный вес'];
}

function findAlternativeExercise(originalExercise: any, availableEquipment: string[]) {
    const alternatives = getExerciseAlternatives(originalExercise.name);
    
    for (const alternative of alternatives) {
        if (checkEquipmentAvailability(alternative.name, availableEquipment)) {
            return {
                ...originalExercise,
                name: alternative.name,
                sets_reps: alternative.sets_reps || originalExercise.sets_reps
            };
        }
    }
    
    // Если альтернатив нет, возвращаем упражнение с собственным весом
    return {
        ...originalExercise,
        name: 'Упражнение с собственным весом',
        sets_reps: '3x10-15'
    };
}

function getExerciseAlternatives(exerciseName: string) {
    const alternativesMap: { [key: string]: any[] } = {
        'жим лежа': [
            { name: 'отжимания', sets_reps: '3x10-15' },
            { name: 'жим гантелей лежа', sets_reps: '3x8-12' }
        ],
        'присед': [
            { name: 'приседания с собственным весом', sets_reps: '3x15-20' },
            { name: 'выпады', sets_reps: '3x10-12' }
        ],
        'становая тяга': [
            { name: 'румынская тяга с гантелями', sets_reps: '3x10-12' },
            { name: 'мостик', sets_reps: '3x15-20' }
        ]
        // Добавьте больше альтернатив
    };
    
    return alternativesMap[exerciseName.toLowerCase()] || [];
}

function adaptExerciseIntensity(exercise: any, intensityMultiplier: number, fitnessLevel: number) {
    // Адаптируем количество подходов и повторений
    let adaptedSetsReps = exercise.sets_reps;
    
    if (fitnessLevel < 3) {
        // Для начинающих уменьшаем нагрузку
        adaptedSetsReps = adaptedSetsReps.replace(/(\d+)x(\d+)/, (match: string, sets: string, reps: string) => {
            const newSets = Math.max(2, Math.floor(parseInt(sets) * 0.7));
            const newReps = Math.max(8, Math.floor(parseInt(reps) * 0.8));
            return `${newSets}x${newReps}`;
        });
    } else if (fitnessLevel > 7) {
        // Для продвинутых увеличиваем нагрузку
        adaptedSetsReps = adaptedSetsReps.replace(/(\d+)x(\d+)/, (match: string, sets: string, reps: string) => {
            const newSets = Math.min(6, Math.ceil(parseInt(sets) * 1.2));
            const newReps = Math.min(15, Math.ceil(parseInt(reps) * 1.1));
            return `${newSets}x${newReps}`;
        });
    }
    
    return {
        ...exercise,
        sets_reps: adaptedSetsReps,
        intensity: exercise.intensity || 'средняя'
    };
} 