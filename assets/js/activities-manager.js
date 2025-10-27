// Activities management module
import { supabase } from '../../src/integrations/supabase/client.js';

// Add new activity
export async function addActivity(activityData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('activities')
      .insert([{
        user_id: user.id,
        activity_type: activityData.type,
        steps: activityData.steps || 0,
        duration_minutes: activityData.duration || null,
        calories_burned: activityData.calories || null,
        notes: activityData.notes || null,
        activity_date: activityData.date || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding activity:', error);
    return { success: false, error: error.message };
  }
}

// Get activities
export async function getActivities(limit = 30) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching activities:', error);
    return { success: false, error: error.message };
  }
}

// Update activity
export async function updateActivity(id, updates) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating activity:', error);
    return { success: false, error: error.message };
  }
}

// Delete activity
export async function deleteActivity(id) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting activity:', error);
    return { success: false, error: error.message };
  }
}

// Get today's activity summary
export async function getTodayActivity() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .eq('activity_date', today);
    
    if (error) throw error;
    
    // Calculate totals
    const totals = {
      steps: 0,
      duration: 0,
      calories: 0
    };
    
    if (data && data.length > 0) {
      data.forEach(activity => {
        totals.steps += activity.steps || 0;
        totals.duration += activity.duration_minutes || 0;
        totals.calories += activity.calories_burned || 0;
      });
    }
    
    return { success: true, data: totals };
  } catch (error) {
    console.error('Error fetching today activity:', error);
    return { success: false, error: error.message };
  }
}

export { loadActivitiesUI };
