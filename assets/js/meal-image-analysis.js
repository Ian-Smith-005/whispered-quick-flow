// Meal image analysis using AI
import { supabase } from '../../src/integrations/supabase/client.js';
import { formatMealAnalysis } from './ai-response-formatter.js';

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-meal-image`;

export function initializeMealImageAnalysis() {
  const uploadBtn = document.getElementById('uploadMealImage');
  const cameraBtn = document.getElementById('takeMealPhoto');
  
  // Create separate inputs for upload and camera
  const uploadInput = document.createElement('input');
  uploadInput.type = 'file';
  uploadInput.accept = 'image/*';
  uploadInput.style.display = 'none';
  document.body.appendChild(uploadInput);

  const cameraInput = document.createElement('input');
  cameraInput.type = 'file';
  cameraInput.accept = 'image/*';
  cameraInput.setAttribute('capture', 'environment'); // Use back camera
  cameraInput.style.display = 'none';
  document.body.appendChild(cameraInput);

  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      uploadInput.click();
    });
  }

  if (cameraBtn) {
    cameraBtn.addEventListener('click', () => {
      cameraInput.click();
    });
  }

  uploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await analyzeMealImage(file);
    uploadInput.value = '';
  });

  cameraInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await analyzeMealImage(file);
    cameraInput.value = '';
  });
}

async function analyzeMealImage(file) {
  const analysisResultDiv = document.getElementById('mealAnalysisResult');
  
  if (!analysisResultDiv) {
    console.error('Analysis result container not found');
    return;
  }

  try {
    // Show loading
    analysisResultDiv.innerHTML = `
      <div class="alert alert-info">
        <i class="fas fa-spinner fa-spin"></i> Analyzing your meal...
      </div>
    `;
    analysisResultDiv.style.display = 'block';

    // Convert image to base64
    const base64Image = await fileToBase64(file);

    // Get session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Call analysis function
    const response = await fetch(ANALYZE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        imageBase64: base64Image
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Analysis failed');
    }

    const result = await response.json();
    displayAnalysisResult(result.analysis, analysisResultDiv);

    // Refresh meals table if visible
    const mealsTable = document.getElementById('mealsTableBody');
    if (mealsTable) {
      await loadMealsTable();
    }

  } catch (error) {
    console.error('Meal analysis error:', error);
    analysisResultDiv.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-circle"></i> Error: ${error.message}
      </div>
    `;
  }
}

function displayAnalysisResult(analysis, container) {
  container.innerHTML = formatMealAnalysis(analysis);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Load meals table
async function loadMealsTable() {
  const { getMeals } = await import('./dashboard-data.js');
  const result = await getMeals(20);
  
  if (!result.success) {
    console.error('Failed to load meals:', result.error);
    return;
  }

  const tableBody = document.getElementById('mealsTableBody');
  if (!tableBody) return;

  if (!result.data || result.data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No meals logged yet</td></tr>';
    return;
  }

  tableBody.innerHTML = result.data.map(meal => `
    <tr>
      <td>${new Date(meal.meal_time).toLocaleString()}</td>
      <td>${meal.meal_name}</td>
      <td>${meal.meal_type || 'N/A'}</td>
      <td>${meal.calories || 'N/A'}</td>
      <td>${meal.carbohydrates || 'N/A'}</td>
      <td>
        ${meal.ai_analyzed ? '<span class="badge bg-success"><i class="fas fa-robot"></i> AI</span>' : ''}
        <button class="btn btn-sm btn-danger" onclick="deleteMealById('${meal.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Make deleteMealById globally available
window.deleteMealById = async function(mealId) {
  if (!confirm('Are you sure you want to delete this meal?')) return;
  
  const { deleteMeal } = await import('./dashboard-data.js');
  const result = await deleteMeal(mealId);
  
  if (result.success) {
    await loadMealsTable();
  } else {
    alert('Failed to delete meal: ' + result.error);
  }
};
