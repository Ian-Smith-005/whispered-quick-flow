-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  date_of_birth DATE,
  diabetes_type TEXT CHECK (diabetes_type IN ('type1', 'type2', 'prediabetes', 'gestational')),
  diagnosis_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meals table for meal tracking
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  description TEXT,
  calories NUMERIC,
  carbohydrates NUMERIC,
  protein NUMERIC,
  fat NUMERIC,
  fiber NUMERIC,
  image_url TEXT,
  ai_analyzed BOOLEAN DEFAULT false,
  meal_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create glucose_readings table for blood glucose tracking
CREATE TABLE public.glucose_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  glucose_value NUMERIC NOT NULL,
  reading_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reading_context TEXT CHECK (reading_context IN ('fasting', 'before_meal', 'after_meal', 'bedtime', 'random')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_metrics table for health metrics
CREATE TABLE public.user_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('weight', 'blood_pressure', 'a1c', 'medication', 'exercise')),
  value JSONB NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_insights table for AI-generated recommendations
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('meal_suggestion', 'glucose_pattern', 'health_tip', 'chat_response')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glucose_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for meals table
CREATE POLICY "Users can view their own meals"
  ON public.meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meals"
  ON public.meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals"
  ON public.meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals"
  ON public.meals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for glucose_readings table
CREATE POLICY "Users can view their own glucose readings"
  ON public.glucose_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own glucose readings"
  ON public.glucose_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own glucose readings"
  ON public.glucose_readings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own glucose readings"
  ON public.glucose_readings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_metrics table
CREATE POLICY "Users can view their own metrics"
  ON public.user_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics"
  ON public.user_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
  ON public.user_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metrics"
  ON public.user_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_insights table
CREATE POLICY "Users can view their own AI insights"
  ON public.ai_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI insights"
  ON public.ai_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_meals_updated_at
  BEFORE UPDATE ON public.meals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_glucose_readings_updated_at
  BEFORE UPDATE ON public.glucose_readings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_metrics_updated_at
  BEFORE UPDATE ON public.user_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better query performance
CREATE INDEX idx_meals_user_id ON public.meals(user_id);
CREATE INDEX idx_meals_meal_time ON public.meals(meal_time);
CREATE INDEX idx_glucose_readings_user_id ON public.glucose_readings(user_id);
CREATE INDEX idx_glucose_readings_time ON public.glucose_readings(reading_time);
CREATE INDEX idx_user_metrics_user_id ON public.user_metrics(user_id);
CREATE INDEX idx_user_metrics_type ON public.user_metrics(metric_type);
CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);