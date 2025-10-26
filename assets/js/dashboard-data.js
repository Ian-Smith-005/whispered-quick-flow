// Dashboard data management using Supabase
import { supabase } from '../../src/integrations/supabase/client.js';

// ============= MEALS CRUD =============

export async function addMeal(mealData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('meals')
      .insert([{
        user_id: user.id,
        meal_name: mealData.name,
        meal_type: mealData.type,
        description: mealData.description,
        calories: mealData.calories || null,
        carbohydrates: mealData.carbs || null,
        protein: mealData.protein || null,
        fat: mealData.fat || null,
        fiber: mealData.fiber || null,
        meal_time: mealData.time || new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding meal:', error);
    return { success: false, error: error.message };
  }
}

export async function getMeals(limit = 50) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .order('meal_time', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching meals:', error);
    return { success: false, error: error.message };
  }
}

export async function updateMeal(mealId, updates) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('meals')
      .update(updates)
      .eq('id', mealId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating meal:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMeal(mealId) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting meal:', error);
    return { success: false, error: error.message };
  }
}

// ============= GLUCOSE READINGS CRUD =============

export async function addGlucoseReading(readingData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('glucose_readings')
      .insert([{
        user_id: user.id,
        glucose_value: readingData.value,
        reading_context: readingData.context,
        notes: readingData.notes || null,
        reading_time: readingData.time || new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding glucose reading:', error);
    return { success: false, error: error.message };
  }
}

export async function getGlucoseReadings(limit = 50) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('glucose_readings')
      .select('*')
      .eq('user_id', user.id)
      .order('reading_time', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching glucose readings:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteGlucoseReading(readingId) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('glucose_readings')
      .delete()
      .eq('id', readingId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting glucose reading:', error);
    return { success: false, error: error.message };
  }
}

// ============= USER METRICS CRUD =============

export async function addUserMetric(metricData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_metrics')
      .insert([{
        user_id: user.id,
        metric_type: metricData.type,
        value: metricData.value, // JSONB field
        notes: metricData.notes || null,
        recorded_at: metricData.time || new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding metric:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserMetrics(metricType = null, limit = 50) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return { success: false, error: error.message };
  }
}

// ============= AI INSIGHTS =============

export async function getAIInsights(limit = 10) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    return { success: false, error: error.message };
  }
}

// ============= USER PROFILE =============

export async function updateUserProfile(profileData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: profileData.fullName,
        date_of_birth: profileData.dateOfBirth,
        diabetes_type: profileData.diabetesType,
        diagnosis_date: profileData.diagnosisDate
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserProfile() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { success: false, error: error.message };
  }
}

// ============= HELPER FUNCTIONS =============

async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

// ============= REALTIME SUBSCRIPTIONS =============

export function subscribeToMeals(callback) {
  return supabase
    .channel('meals-changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'meals' 
    }, callback)
    .subscribe();
}

export function subscribeToGlucoseReadings(callback) {
  return supabase
    .channel('glucose-changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'glucose_readings' 
    }, callback)
    .subscribe();
}
