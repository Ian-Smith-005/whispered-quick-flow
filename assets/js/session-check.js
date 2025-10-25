// Session check for protected pages (dashboard, etc.)
// This script should be included at the top of protected pages

(async function() {
  // Show loading state
  const preloader = document.getElementById('sectionPreloader');
  if (preloader) {
    preloader.style.display = 'flex';
  }
  
  try {
    // Check authentication
    const user = await checkAuth();
    
    if (user) {
      // User is authenticated, display user info if elements exist
      const userNameElement = document.getElementById('userName');
      const userEmailElement = document.getElementById('userEmail');
      
      if (userNameElement && user.user_metadata) {
        const fullName = user.user_metadata.full_name || 
                        `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim() ||
                        user.email.split('@')[0];
        userNameElement.textContent = fullName;
      }
      
      if (userEmailElement) {
        userEmailElement.textContent = user.email;
      }
    }
  } catch (error) {
    console.error('Session check error:', error);
    window.location.href = 'login.html';
  } finally {
    // Hide loading state
    if (preloader) {
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }
  }
})();

// Add logout functionality to logout buttons
document.addEventListener('DOMContentLoaded', () => {
  const logoutButtons = document.querySelectorAll('[data-logout]');
  logoutButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        handleLogout();
      }
    });
  });
});
