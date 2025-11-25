// Load AI-generated profile analysis
import { supabase } from '../../src/integrations/supabase/client.js';

const PROFILE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-profile-analysis`;

export async function loadProfileAnalysis() {
  const profileSection = document.getElementById('profile');
  
  if (!profileSection) {
    console.error('Profile section not found');
    return;
  }

  try {
    // Get session and user info
    const { data: { session, user } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Update basic user info
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    if (userNameEl) userNameEl.textContent = user.email.split('@')[0];
    if (userEmailEl) userEmailEl.textContent = user.email;

    // Check if AI analysis section exists, if not create it
    let analysisContainer = document.getElementById('aiProfileAnalysis');
    if (!analysisContainer) {
      // Insert after the user profile card
      const profileCard = profileSection.querySelector('.col-md-4');
      if (profileCard) {
        const newRow = document.createElement('div');
        newRow.className = 'row mb-4';
        newRow.innerHTML = '<div class="col-12" id="aiProfileAnalysis"></div>';
        profileCard.parentElement.parentElement.insertAdjacentElement('afterend', newRow);
        analysisContainer = document.getElementById('aiProfileAnalysis');
      }
    }

    if (!analysisContainer) return;

    // Show loading
    analysisContainer.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body text-center">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Analyzing your health profile...</p>
        </div>
      </div>
    `;

    // Call profile analysis function
    const response = await fetch(PROFILE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate profile analysis');
    }

    const result = await response.json();
    displayProfileAnalysis(result.analysis, analysisContainer);

  } catch (error) {
    console.error('Profile analysis error:', error);
    const analysisContainer = document.getElementById('aiProfileAnalysis');
    if (analysisContainer) {
      analysisContainer.innerHTML = `
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Unable to load profile analysis: ${error.message}
        </div>
      `;
    }
  }
}

function displayProfileAnalysis(analysis, container) {
  if (!analysis) return;

  container.innerHTML = `
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h5 class="card-title mb-4">
          <i class="fas fa-user-md text-success me-2"></i>AI Health Profile Analysis
        </h5>

        ${analysis.statistics ? `
          <div class="row text-center mb-4">
            <div class="col-6 col-md-3">
              <div class="p-3 bg-light rounded">
                <h4 class="text-success mb-1">${analysis.statistics.totalMeals}</h4>
                <small class="text-muted">Meals Logged</small>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="p-3 bg-light rounded">
                <h4 class="text-info mb-1">${analysis.statistics.avgGlucose}</h4>
                <small class="text-muted">Avg Glucose</small>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="p-3 bg-light rounded">
                <h4 class="text-warning mb-1">${analysis.statistics.avgCalories}</h4>
                <small class="text-muted">Avg Calories</small>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="p-3 bg-light rounded">
                <h4 class="text-primary mb-1">${analysis.statistics.avgCarbs}g</h4>
                <small class="text-muted">Avg Carbs</small>
              </div>
            </div>
          </div>
        ` : ''}

        ${analysis.healthStatus ? `
          <div class="mb-4">
            <h6 class="text-success mb-2">
              <i class="fas fa-heartbeat me-2"></i>Overall Health Status
            </h6>
            <p class="text-muted">${analysis.healthStatus}</p>
          </div>
        ` : ''}

        ${analysis.dietAnalysis ? `
          <div class="mb-4">
            <h6 class="text-success mb-2">
              <i class="fas fa-utensils me-2"></i>Diet Patterns
            </h6>
            <p class="text-muted">${analysis.dietAnalysis}</p>
          </div>
        ` : ''}

        ${analysis.glucoseControl ? `
          <div class="mb-4">
            <h6 class="text-success mb-2">
              <i class="fas fa-tint me-2"></i>Glucose Control
            </h6>
            <p class="text-muted">${analysis.glucoseControl}</p>
          </div>
        ` : ''}

        ${analysis.strengths?.length ? `
          <div class="mb-4">
            <h6 class="text-success mb-2">
              <i class="fas fa-check-circle me-2"></i>Your Strengths
            </h6>
            <ul class="list-unstyled">
              ${analysis.strengths.map(strength => `
                <li class="mb-2">
                  <i class="fas fa-star text-warning me-2"></i>${strength}
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        ${analysis.improvements?.length ? `
          <div class="mb-4">
            <h6 class="text-success mb-2">
              <i class="fas fa-arrow-up me-2"></i>Areas for Improvement
            </h6>
            <ul class="list-unstyled">
              ${analysis.improvements.map(improvement => `
                <li class="mb-2">
                  <i class="fas fa-exclamation-circle text-info me-2"></i>${improvement}
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        ${analysis.recommendations?.length ? `
          <div class="alert alert-success border-0 mb-0" style="background-color: #e8f4f8;">
            <h6 class="alert-heading mb-3">
              <i class="fas fa-lightbulb me-2"></i>Personalized Recommendations
            </h6>
            <ul class="mb-0">
              ${analysis.recommendations.map(rec => `
                <li class="mb-2">${rec}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
