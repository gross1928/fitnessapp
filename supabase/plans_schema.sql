-- Main plans table
CREATE TABLE public.plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL, -- 'nutrition', 'workout', or 'combined'
    goals text,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.plans FOR SELECT USING (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Enable insert for authenticated users" ON public.plans FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Enable update for authenticated users" ON public.plans FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable delete for authenticated users" ON public.plans FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);


-- Nutrition plans details
CREATE TABLE public.nutrition_plans (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE NOT NULL,
    day_of_week smallint NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
    meal_type text NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    description text,
    calories integer,
    protein real,
    fats real,
    carbs real,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for plan owners" ON public.nutrition_plans FOR SELECT USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = nutrition_plans.plan_id AND plans.user_id = auth.uid())));
CREATE POLICY "Enable insert for plan owners" ON public.nutrition_plans FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = nutrition_plans.plan_id AND plans.user_id = auth.uid())));
CREATE POLICY "Enable update for plan owners" ON public.nutrition_plans FOR UPDATE USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = nutrition_plans.plan_id AND plans.user_id = auth.uid())));
CREATE POLICY "Enable delete for plan owners" ON public.nutrition_plans FOR DELETE USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = nutrition_plans.plan_id AND plans.user_id = auth.uid())));


-- Workout plans details
CREATE TABLE public.workout_plans (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE NOT NULL,
    day_of_week smallint NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for plan owners" ON public.workout_plans FOR SELECT USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = workout_plans.plan_id AND plans.user_id = auth.uid())));
CREATE POLICY "Enable insert for plan owners" ON public.workout_plans FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = workout_plans.plan_id AND plans.user_id = auth.uid())));
CREATE POLICY "Enable update for plan owners" ON public.workout_plans FOR UPDATE USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = workout_plans.plan_id AND plans.user_id = auth.uid())));
CREATE POLICY "Enable delete for plan owners" ON public.workout_plans FOR DELETE USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = workout_plans.plan_id AND plans.user_id = auth.uid())));


-- Workout exercises details
CREATE TABLE public.workout_exercises (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    workout_plan_id bigint REFERENCES public.workout_plans(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    sets integer,
    reps text, -- "8-12" or "to failure"
    rest_seconds integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for plan owners" ON public.workout_exercises FOR SELECT USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans p JOIN public.workout_plans wp ON p.id = wp.plan_id WHERE wp.id = workout_exercises.workout_plan_id AND p.user_id = auth.uid())));
CREATE POLICY "Enable insert for plan owners" ON public.workout_exercises FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans p JOIN public.workout_plans wp ON p.id = wp.plan_id WHERE wp.id = workout_exercises.workout_plan_id AND p.user_id = auth.uid())));
CREATE POLICY "Enable update for plan owners" ON public.workout_exercises FOR UPDATE USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans p JOIN public.workout_plans wp ON p.id = wp.plan_id WHERE wp.id = workout_exercises.workout_plan_id AND p.user_id = auth.uid())));
CREATE POLICY "Enable delete for plan owners" ON public.workout_exercises FOR DELETE USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.plans p JOIN public.workout_plans wp ON p.id = wp.plan_id WHERE wp.id = workout_exercises.workout_plan_id AND p.user_id = auth.uid()))); 