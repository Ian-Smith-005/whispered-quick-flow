-- Create medications table
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT,
  notes TEXT,
  start_date DATE,
  end_date DATE,
  reminder_times JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  steps INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  notes TEXT,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_type TEXT,
  duration_days INTEGER DEFAULT 7,
  suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create health_reports table
CREATE TABLE IF NOT EXISTS public.health_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  period TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_user BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table (for newsletter)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create contacts table (for contact form)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medications
CREATE POLICY "Users can view their own medications" ON public.medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own medications" ON public.medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own medications" ON public.medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own medications" ON public.medications FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for activities
CREATE POLICY "Users can view their own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own activities" ON public.activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own activities" ON public.activities FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for meal_plans
CREATE POLICY "Users can view their own meal plans" ON public.meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own meal plans" ON public.meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meal plans" ON public.meal_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meal plans" ON public.meal_plans FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for health_reports
CREATE POLICY "Users can view their own health reports" ON public.health_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own health reports" ON public.health_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat_history
CREATE POLICY "Users can view their own chat history" ON public.chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own chat history" ON public.chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own chat history" ON public.chat_history FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for subscriptions (public inserts, no selects/updates/deletes for users)
CREATE POLICY "Anyone can subscribe" ON public.subscriptions FOR INSERT WITH CHECK (true);

-- RLS Policies for contacts (public inserts only)
CREATE POLICY "Anyone can submit contact form" ON public.contacts FOR INSERT WITH CHECK (true);

-- RLS Policies for testimonials (public can view featured, users can view their own)
CREATE POLICY "Anyone can view featured testimonials" ON public.testimonials FOR SELECT USING (is_featured = true);
CREATE POLICY "Users can view their own testimonials" ON public.testimonials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own testimonials" ON public.testimonials FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();