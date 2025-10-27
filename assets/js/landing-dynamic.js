// Dynamic data loading for landing pages
import { supabase } from '../../src/integrations/supabase/client.js';

// Preloader functionality
function initPreloader() {
  const preloader = document.getElementById("preloader");
  
  const maxLoadTime = 5000;
  
  const hidePreloader = () => {
    if (preloader && !preloader.classList.contains('fade-out')) {
      preloader.classList.add("fade-out");
      setTimeout(() => {
        if (preloader) {
          preloader.style.display = "none";
        }
      }, 1000);
    }
  };
  
  if (document.readyState === 'complete') {
    setTimeout(hidePreloader, 500);
  } else {
    const checkContentReady = () => {
      if (document.readyState === 'complete') {
        hidePreloader();
      }
    };
    
    document.addEventListener('readystatechange', checkContentReady);
    setTimeout(hidePreloader, maxLoadTime);
  }
}

// Bubble background functionality
function initBubbles() {
  const bubbleContainer = document.getElementById('bubbleContainer');
  if (!bubbleContainer) return;
  
  const bubbleCount = 50;
  
  function createBubble() {
    const bubble = document.createElement('div');
    const size = Math.random() * 90 + 10;
    bubble.classList.add('bubble');
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}vw`;
    bubble.style.animationDuration = `${Math.random() * 10 + 10}s`;
    bubble.style.animationDelay = `${Math.random() * 10}s`;
    bubbleContainer.appendChild(bubble);
    
    bubble.addEventListener('animationend', () => {
      bubble.remove();
      createBubble();
    });
  }
  
  for (let i = 0; i < bubbleCount; i++) {
    createBubble();
  }
}

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

// Initialize everything on page load
window.addEventListener('load', () => {
  initPreloader();
  initBubbles();
});

document.addEventListener('DOMContentLoaded', async () => {
  const userCount = await fetchUserCount();
  const countElement = document.getElementById('diacare-count');
  
  if (countElement && userCount > 0) {
    animateCountUp('diacare-count', userCount);
  } else if (countElement) {
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
