// Supabase client initialization
const SUPABASE_URL = 'https://bkaahxlulailvpszbkfo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYWFoeGx1bGFpbHZwc3pia2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTc0ODksImV4cCI6MjA3NjkzMzQ4OX0.UkKzQ1BJ_fu_A9H8Wz8KDz-2yBHZZNbgcKvnQ455cdE';

// Import Supabase client from CDN
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Show loading state
function showLoading(button, text = 'Loading...') {
  button.disabled = true;
  button.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${text}`;
}

// Hide loading state
function hideLoading(button, text) {
  button.disabled = false;
  button.innerHTML = text;
}

// Show error message
function showError(message, formId) {
  const form = document.getElementById(formId);
  let errorDiv = form.querySelector('.error-message');
  
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'error-message alert alert-danger mt-3';
    errorDiv.style.animation = 'fadeIn 0.3s ease-in';
    form.appendChild(errorDiv);
  }
  
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

// Show success message
function showSuccess(message, formId) {
  const form = document.getElementById(formId);
  let successDiv = form.querySelector('.success-message');
  
  if (!successDiv) {
    successDiv = document.createElement('div');
    successDiv.className = 'success-message alert alert-success mt-3';
    successDiv.style.animation = 'fadeIn 0.3s ease-in';
    form.appendChild(successDiv);
  }
  
  successDiv.textContent = message;
  successDiv.style.display = 'block';
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password) {
  return password.length >= 6;
}

// Register new user
async function handleSignUp(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const firstName = form.querySelector('#firstName').value.trim();
  const lastName = form.querySelector('#lastName').value.trim();
  const email = form.querySelector('#email').value.trim();
  const password = form.querySelector('#password').value;
  
  // Validation
  if (!firstName || !lastName || !email || !password) {
    showError('All fields are required', 'registerForm');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('Please enter a valid email address', 'registerForm');
    return;
  }
  
  if (!isValidPassword(password)) {
    showError('Password must be at least 6 characters long', 'registerForm');
    return;
  }
  
  showLoading(submitButton, 'Creating account...');
  
  try {
    const redirectUrl = `${window.location.origin}/dashboard.html`;
    
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    if (data.user) {
      showSuccess('Account created successfully! Redirecting...', 'registerForm');
      
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    }
  } catch (error) {
    console.error('Sign up error:', error);
    
    if (error.message.includes('already registered')) {
      showError('This email is already registered. Please login instead.', 'registerForm');
    } else {
      showError(error.message || 'Failed to create account. Please try again.', 'registerForm');
    }
    
    hideLoading(submitButton, 'Sign Up');
  }
}

// Login existing user
async function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const email = form.querySelector('#email').value.trim();
  const password = form.querySelector('#password').value;
  const rememberMe = form.querySelector('#remember')?.checked || false;
  
  // Validation
  if (!email || !password) {
    showError('Email and password are required', 'loginForm');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('Please enter a valid email address', 'loginForm');
    return;
  }
  
  showLoading(submitButton, 'Signing in...');
  
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });
    
    if (error) {
      throw error;
    }
    
    if (data.session) {
      showSuccess('Login successful! Redirecting...', 'loginForm');
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    }
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message.includes('Invalid login credentials')) {
      showError('Invalid email or password. Please try again.', 'loginForm');
    } else if (error.message.includes('Email not confirmed')) {
      showError('Please confirm your email before logging in.', 'loginForm');
    } else {
      showError(error.message || 'Failed to login. Please try again.', 'loginForm');
    }
    
    hideLoading(submitButton, 'Sign In');
  }
}

// Logout user
async function handleLogout() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    // Clear local storage
    localStorage.removeItem('rememberMe');
    
    // Redirect to login page
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
    alert('Failed to logout. Please try again.');
  }
}

// Check if user is authenticated (for protected pages)
async function checkAuth() {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    if (!session) {
      // Not authenticated, redirect to login
      window.location.href = 'login.html';
      return null;
    }
    
    return session.user;
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = 'login.html';
    return null;
  }
}

// Check if user is already logged in (for login/register pages)
async function redirectIfAuthenticated() {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (session && session.user) {
      // Already authenticated, redirect to dashboard
      window.location.href = 'dashboard.html';
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }
}

// Initialize auth state listener
function initAuthListener() {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // Clear any stored data
      localStorage.clear();
    }
  });
}

// Handle forgot password
async function handleForgotPassword(event) {
  event.preventDefault();
  
  const email = prompt('Please enter your email address:');
  
  if (!email) {
    return;
  }
  
  if (!isValidEmail(email)) {
    alert('Please enter a valid email address');
    return;
  }
  
  try {
    const redirectUrl = `${window.location.origin}/login.html`;
    
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    
    if (error) {
      throw error;
    }
    
    alert('Password reset email sent! Please check your inbox.');
  } catch (error) {
    console.error('Password reset error:', error);
    alert(error.message || 'Failed to send reset email. Please try again.');
  }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
  initAuthListener();
  
  // Attach forgot password handler if link exists
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
  }
});
