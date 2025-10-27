// Dashboard data loader and initializer
import { supabase } from '../../src/integrations/supabase/client.js';
import { 
  getMeals, 
  getGlucoseReadings, 
  getUserMetrics,
  addMeal,
  addGlucoseReading,
  addUserMetric
} from './dashboard-data.js';

// Global function to load dashboard data
window.loadDashboardData = async function() {
  try {
    await Promise.all([
      loadQuickStats(),
      loadRecentMeals(),
      loadGlucoseChart(),
      loadActivityData()
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
};

// Load quick stats (glucose, meals today, etc.)
async function loadQuickStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get latest glucose reading
    const { data: glucoseData } = await supabase
      .from('glucose_readings')
      .select('glucose_value')
      .order('reading_time', { ascending: false })
      .limit(1)
      .single();
    
    // Get today's meals count
    const { count: mealsToday } = await supabase
      .from('meals')
      .select('*', { count: 'exact', head: true })
      .gte('meal_time', today.toISOString());
    
    // Get today's activity
    const { data: activityData } = await supabase
      .from('activities')
      .select('steps')
      .eq('activity_date', today.toISOString().split('T')[0])
      .single();
    
    // Update UI
    const glucoseElement = document.getElementById('currentGlucose');
    if (glucoseElement && glucoseData) {
      glucoseElement.textContent = `${glucoseData.glucose_value} mg/dL`;
    } else if (glucoseElement) {
      glucoseElement.textContent = 'No data yet';
    }
    
    const mealsElement = document.getElementById('mealsToday');
    if (mealsElement) {
      mealsElement.textContent = mealsToday || 0;
    }
    
    const stepsElement = document.getElementById('stepsToday');
    if (stepsElement && activityData) {
      const steps = activityData.steps || 0;
      const goal = 8000;
      stepsElement.textContent = `${steps} / ${goal}`;
    } else if (stepsElement) {
      stepsElement.textContent = '0 / 8,000';
    }
    
  } catch (error) {
    console.error('Error loading quick stats:', error);
  }
}

// Load recent meals table
async function loadRecentMeals() {
  try {
    const result = await getMeals(10);
    
    const tableBody = document.getElementById('recentMealsTable');
    if (!tableBody) return;
    
    if (!result.success || !result.data || result.data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No meals logged yet. <a href="#" onclick="document.querySelector(\'[data-target=\\\"analysis\\\"]\').click()">Log your first meal</a>!</td></tr>';
      return;
    }
    
    tableBody.innerHTML = result.data.map(meal => `
      <tr>
        <td>${new Date(meal.meal_time).toLocaleString()}</td>
        <td>${meal.meal_name}</td>
        <td>${meal.meal_type || 'N/A'}</td>
        <td>${meal.calories || 'N/A'}</td>
        <td>
          ${meal.ai_analyzed ? '<span class="badge bg-success"><i class="fas fa-robot"></i> AI</span>' : ''}
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading recent meals:', error);
  }
}

// Load glucose chart with real data
async function loadGlucoseChart() {
  try {
    const result = await getGlucoseReadings(7);
    
    if (!result.success || !result.data || result.data.length === 0) {
      // Show "no data" message
      const chartContainer = document.getElementById('glucoseChartdash')?.parentElement;
      if (chartContainer) {
        chartContainer.innerHTML = '<p class="text-center text-muted">No glucose data yet. Start logging to see your trends!</p>';
      }
      return;
    }
    
    // Prepare chart data
    const labels = result.data.map(r => new Date(r.reading_time).toLocaleDateString('en-US', { weekday: 'short' })).reverse();
    const values = result.data.map(r => r.glucose_value).reverse();
    
    // Update chart if it exists
    if (window.Chart && document.getElementById('glucoseChartdash')) {
      new Chart(document.getElementById('glucoseChartdash'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Glucose (mg/dL)',
            data: values,
            borderColor: '#20963b',
            backgroundColor: 'rgba(32, 150, 59, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
          scales: {
            y: {
              beginAtZero: false,
              suggestedMin: 70,
              suggestedMax: 180
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error loading glucose chart:', error);
  }
}

// Load activity data
async function loadActivityData() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('activity_date', today)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error;
    }
    
    // Update activity display
    const activitySection = document.getElementById('activitySection');
    if (activitySection && data) {
      activitySection.innerHTML = `
        <div class="alert alert-info">
          <h5><i class="fas fa-walking"></i> Today's Activity</h5>
          <p><strong>Steps:</strong> ${data.steps || 0} / 8,000</p>
          <p><strong>Duration:</strong> ${data.duration_minutes || 0} minutes</p>
          <p><strong>Calories Burned:</strong> ${data.calories_burned || 0} kcal</p>
        </div>
      `;
    } else if (activitySection) {
      activitySection.innerHTML = '<p class="text-muted">No activity logged today. Get moving!</p>';
    }
  } catch (error) {
    console.error('Error loading activity data:', error);
  }
}

// Initialize on dashboard load
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on dashboard page
  if (document.getElementById('dashboard')) {
    loadDashboardData();
  }
});

export { loadDashboardData, loadQuickStats, loadRecentMeals, loadGlucoseChart, loadActivityData };
