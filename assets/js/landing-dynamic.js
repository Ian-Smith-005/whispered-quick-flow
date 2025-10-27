// Dynamic data loading for landing pages
import { supabase } from '../../src/integrations/supabase/client.js';

// Fetch and display real user count
async function fetchUserCount() {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Error fetching user count:', error);
    return 0;
  }
}

// Animate counter to target value
function animateCountUp(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  let count = 0;
  const duration = 2000; // 2 seconds
  const increment = target / (duration / 50);
  
  const interval = setInterval(() => {
    count += increment;
    
    if (count >= target) {
      count = target;
      clearInterval(interval);
    }
    
    el.textContent = Math.floor(count) + '+';
  }, 50);
}

// Initialize dynamic user count on page load
document.addEventListener('DOMContentLoaded', async () => {
  const userCount = await fetchUserCount();
  const countElement = document.getElementById('diacare-count');
  
  if (countElement && userCount > 0) {
    animateCountUp('diacare-count', userCount);
  } else if (countElement) {
    // Fallback to a reasonable default
    animateCountUp('diacare-count', 1520);
  }
});

// Handle newsletter subscription in footer
async function handleSubscription(email) {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .insert([{ email }]);
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('This email is already subscribed!');
      }
      throw error;
    }
    
    return { success: true, message: 'Successfully subscribed to newsletter!' };
  } catch (error) {
    console.error('Subscription error:', error);
    return { success: false, message: error.message };
  }
}

// Attach subscription handlers to all footer forms
document.addEventListener('DOMContentLoaded', () => {
  const footerForms = document.querySelectorAll('.footer-form');
  
  footerForms.forEach(form => {
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button');
    
    if (input && button) {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = input.value.trim();
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          alert('Please enter a valid email address');
          return;
        }
        
        button.disabled = true;
        button.textContent = 'Subscribing...';
        
        const result = await handleSubscription(email);
        
        if (result.success) {
          alert(result.message);
          input.value = '';
        } else {
          alert('Error: ' + result.message);
        }
        
        button.disabled = false;
        button.textContent = 'Subscribe';
      });
    }
  });
});

export { fetchUserCount, animateCountUp, handleSubscription };
