// Footer email subscription handler
import { supabase } from '../../src/integrations/supabase/client.js';

async function handleSubscription(email) {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .insert([{ email: email }]);
    
    if (error) {
      // Check if email already exists
      if (error.message.includes('duplicate') || error.code === '23505') {
        return { success: false, message: 'This email is already subscribed!' };
      }
      throw error;
    }
    
    return { success: true, message: 'Successfully subscribed to our newsletter!' };
  } catch (error) {
    console.error('Subscription error:', error);
    return { success: false, message: 'Failed to subscribe. Please try again.' };
  }
}

// Initialize subscription forms
document.addEventListener('DOMContentLoaded', () => {
  const footerForms = document.querySelectorAll('.footer-form');
  
  footerForms.forEach(form => {
    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (submitBtn && emailInput) {
      submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email) {
          alert('Please enter your email address');
          return;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          alert('Please enter a valid email address');
          return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';
        
        const result = await handleSubscription(email);
        
        if (result.success) {
          alert(result.message);
          emailInput.value = '';
        } else {
          alert(result.message);
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subscribe';
      });
    }
  });
});

export { handleSubscription };
