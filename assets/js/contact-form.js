// Contact form submission handler
import { supabase } from '../../src/integrations/supabase/client.js';

async function submitContactForm(formData) {
  try {
    const { error } = await supabase
      .from('contacts')
      .insert([{
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'new'
      }]);
    
    if (error) throw error;
    
    return { success: true, message: 'Message sent successfully! We\'ll respond within 24 hours.' };
  } catch (error) {
    console.error('Contact form error:', error);
    return { success: false, message: 'Failed to send message. Please try again.' };
  }
}

// Initialize contact form handler
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value.trim()
      };
      
      // Validation
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
        alert('Please fill in all fields');
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }
      
      // Disable submit button
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      
      // Submit form
      const result = await submitContactForm(formData);
      
      if (result.success) {
        alert(result.message);
        contactForm.reset();
      } else {
        alert('Error: ' + result.message);
      }
      
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    });
  }
});

export { submitContactForm };
