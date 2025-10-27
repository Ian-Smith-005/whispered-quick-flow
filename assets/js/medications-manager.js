// Medications management module
import { supabase } from '../../src/integrations/supabase/client.js';

// Add new medication
export async function addMedication(medicationData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('medications')
      .insert([{
        user_id: user.id,
        name: medicationData.name,
        dosage: medicationData.dosage,
        frequency: medicationData.frequency,
        notes: medicationData.notes || null,
        start_date: medicationData.startDate || new Date().toISOString().split('T')[0],
        reminder_times: medicationData.reminderTimes || []
      }])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding medication:', error);
    return { success: false, error: error.message };
  }
}

// Get all medications
export async function getMedications() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching medications:', error);
    return { success: false, error: error.message };
  }
}

// Update medication
export async function updateMedication(id, updates) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating medication:', error);
    return { success: false, error: error.message };
  }
}

// Delete medication
export async function deleteMedication(id) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting medication:', error);
    return { success: false, error: error.message };
  }
}

// Load and display medications in UI
export async function loadMedicationsUI() {
  const result = await getMedications();
  const container = document.getElementById('medicationsContainer');
  
  if (!container) return;
  
  if (!result.success || !result.data || result.data.length === 0) {
    container.innerHTML = '<p class="text-muted">No medications added yet. <a href="#" id="addMedicationLink">Add your first medication</a>.</p>';
    return;
  }
  
  container.innerHTML = result.data.map(med => `
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">${med.name}</h5>
        <p class="card-text">
          <strong>Dosage:</strong> ${med.dosage}<br>
          <strong>Frequency:</strong> ${med.frequency || 'Not specified'}<br>
          ${med.notes ? `<strong>Notes:</strong> ${med.notes}<br>` : ''}
          <strong>Started:</strong> ${med.start_date ? new Date(med.start_date).toLocaleDateString() : 'N/A'}
        </p>
        <button class="btn btn-sm btn-danger" onclick="deleteMedicationById('${med.id}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Make delete function globally available
window.deleteMedicationById = async function(id) {
  if (!confirm('Are you sure you want to delete this medication?')) return;
  
  const result = await deleteMedication(id);
  if (result.success) {
    await loadMedicationsUI();
  } else {
    alert('Failed to delete medication: ' + result.error);
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const medicationsContainer = document.getElementById('medicationsContainer');
  if (medicationsContainer) {
    loadMedicationsUI();
  }
});
