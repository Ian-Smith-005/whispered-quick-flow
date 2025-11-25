// Load AI-generated daily tips
import { supabase } from '../../src/integrations/supabase/client.js';

const TIPS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-daily-tips`;

export async function loadDailyTips() {
  const tipsContainer = document.querySelector('#tips .row.g-4');
  
  if (!tipsContainer) {
    console.error('Tips container not found');
    return;
  }

  try {
    // Show loading state
    tipsContainer.innerHTML = `
      <div class="col-12 text-center">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Generating personalized tips based on your meals...</p>
      </div>
    `;

    // Get session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Call tips generation function
    const response = await fetch(TIPS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate tips');
    }

    const result = await response.json();
    displayTips(result.tips, tipsContainer);

  } catch (error) {
    console.error('Tips loading error:', error);
    tipsContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Unable to load personalized tips: ${error.message}
        </div>
      </div>
    `;
  }
}

function displayTips(tips, container) {
  if (!tips || tips.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info">
          Start logging meals to get personalized health tips!
        </div>
      </div>
    `;
    return;
  }

  const iconMap = {
    nutrition: 'fa-apple-alt',
    activity: 'fa-running',
    monitoring: 'fa-heartbeat',
    lifestyle: 'fa-bed',
    general: 'fa-lightbulb'
  };

  container.innerHTML = tips.map(tip => `
    <div class="col-md-6 col-lg-4">
      <div class="card tip-card p-3 h-100">
        <div class="d-flex align-items-start">
          <div class="tip-icon">
            <i class="${tip.icon || iconMap[tip.category] || 'fas fa-lightbulb'}"></i>
          </div>
          <div>
            <h6>${tip.title}</h6>
            <p class="text-muted mb-0">${tip.content}</p>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}
