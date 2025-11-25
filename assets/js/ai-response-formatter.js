// AI Response Formatter - Converts markdown-style text to properly formatted HTML

export function formatAIResponse(text) {
  if (!text) return '';
  
  // Remove asterisks used for bold (**text**)
  let formatted = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Remove single asterisks
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Convert numbered lists (1. 2. 3.)
  formatted = formatted.replace(/(\d+)\.\s+([^\n]+)/g, '<div class="mb-2"><span class="badge bg-primary me-2">$1</span>$2</div>');
  
  // Convert bullet points
  formatted = formatted.replace(/•\s+([^\n]+)/g, '<div class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>$1</div>');
  
  // Convert section headers (text followed by colon at start of line)
  formatted = formatted.replace(/^([A-Z][^:\n]+):$/gm, '<h6 class="text-success mt-3 mb-2"><i class="fas fa-info-circle me-2"></i>$1</h6>');
  
  // Convert inline headers
  formatted = formatted.replace(/([A-Z][^:\n]+):/g, '<strong class="text-success">$1:</strong>');
  
  // Add line breaks for paragraphs (double newlines)
  formatted = formatted.replace(/\n\n/g, '</p><p class="mb-3">');
  
  // Add single line breaks
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Wrap in paragraph
  formatted = `<div class="formatted-response">${formatted}</div>`;
  
  return formatted;
}

export function formatMealAnalysis(analysis) {
  if (!analysis) return '';
  
  const glycemicColor = {
    'low': 'success',
    'medium': 'warning',
    'high': 'danger'
  }[analysis.glycemicImpact?.toLowerCase()] || 'info';

  return `
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <div class="d-flex align-items-center mb-4">
          <i class="fas fa-utensils fa-2x text-success me-3"></i>
          <h4 class="mb-0">${analysis.mealName || 'Meal Analysis'}</h4>
        </div>
        
        ${analysis.foods?.length ? `
          <div class="mb-4">
            <h6 class="text-uppercase text-muted mb-2" style="font-size: 0.85rem; letter-spacing: 1px;">
              <i class="fas fa-list-ul me-2"></i>Identified Foods
            </h6>
            <div class="d-flex flex-wrap gap-2">
              ${analysis.foods.map(food => `
                <span class="badge bg-light text-dark border px-3 py-2" style="font-size: 0.9rem;">
                  ${food}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${analysis.portionSizes ? `
          <div class="mb-4">
            <h6 class="text-uppercase text-muted mb-2" style="font-size: 0.85rem; letter-spacing: 1px;">
              <i class="fas fa-balance-scale me-2"></i>Portion Sizes
            </h6>
            <p class="mb-0" style="line-height: 1.8;">${analysis.portionSizes}</p>
          </div>
        ` : ''}

        <div class="mb-4">
          <h6 class="text-uppercase text-muted mb-3" style="font-size: 0.85rem; letter-spacing: 1px;">
            <i class="fas fa-chart-pie me-2"></i>Nutritional Breakdown
          </h6>
          <div class="row g-3">
            <div class="col-6 col-md-4">
              <div class="p-3 bg-light rounded text-center">
                <div class="h5 mb-1 text-success">${analysis.nutrition?.calories || 0}</div>
                <small class="text-muted">Calories</small>
              </div>
            </div>
            <div class="col-6 col-md-4">
              <div class="p-3 bg-light rounded text-center">
                <div class="h5 mb-1 text-primary">${analysis.nutrition?.carbohydrates || 0}g</div>
                <small class="text-muted">Carbs</small>
              </div>
            </div>
            <div class="col-6 col-md-4">
              <div class="p-3 bg-light rounded text-center">
                <div class="h5 mb-1 text-info">${analysis.nutrition?.protein || 0}g</div>
                <small class="text-muted">Protein</small>
              </div>
            </div>
            <div class="col-6 col-md-4">
              <div class="p-3 bg-light rounded text-center">
                <div class="h5 mb-1 text-warning">${analysis.nutrition?.fat || 0}g</div>
                <small class="text-muted">Fat</small>
              </div>
            </div>
            <div class="col-6 col-md-4">
              <div class="p-3 bg-light rounded text-center">
                <div class="h5 mb-1 text-secondary">${analysis.nutrition?.fiber || 0}g</div>
                <small class="text-muted">Fiber</small>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <h6 class="text-uppercase text-muted mb-2" style="font-size: 0.85rem; letter-spacing: 1px;">
            <i class="fas fa-heartbeat me-2"></i>Glycemic Impact
          </h6>
          <span class="badge bg-${glycemicColor} px-4 py-2" style="font-size: 1rem;">
            ${analysis.glycemicImpact?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>

        ${analysis.recommendations ? `
          <div class="alert alert-info border-0 mb-0" style="background-color: #e8f4f8;">
            <h6 class="alert-heading mb-2">
              <i class="fas fa-lightbulb me-2"></i>Recommendations
            </h6>
            <p class="mb-0" style="line-height: 1.8;">${formatRecommendations(analysis.recommendations)}</p>
          </div>
        ` : ''}

        <div class="alert alert-success border-0 mt-3 mb-0">
          <i class="fas fa-check-circle me-2"></i>Meal saved to your history!
        </div>
      </div>
    </div>
  `;
}

function formatRecommendations(text) {
  // Remove asterisks and format numbers
  let formatted = text.replace(/\*\*/g, '');
  formatted = formatted.replace(/(\d+)\.\s+/g, '<br><strong>$1.</strong> ');
  return formatted;
}

// CSS Styles for formatted responses
const style = document.createElement('style');
style.textContent = `
  .formatted-response {
    line-height: 1.8;
    font-size: 0.95rem;
  }
  
  .formatted-response strong {
    color: #20963b;
    font-weight: 600;
  }
  
  .formatted-response h6 {
    border-left: 3px solid #20963b;
    padding-left: 10px;
  }
  
  .formatted-response .badge {
    font-weight: 500;
  }
`;
document.head.appendChild(style);
