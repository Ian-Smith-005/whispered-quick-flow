const links = document.querySelectorAll("[data-target]");
const sections = document.querySelectorAll(".content-section");
const preloader = document.getElementById("sectionPreloader");

// Hide initial preloader quickly (max 1 second)
window.addEventListener("load", () => {
  setTimeout(() => {
    if (preloader) {
      preloader.classList.add("fade-out");
    }
  }, 1000);
});

// Quick section navigation (500ms preloader)
links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("data-target");

    // Update active nav link
    links.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    // Show brief preloader
    if (preloader) {
      preloader.classList.remove("fade-out");
      preloader.style.visibility = "visible";
      preloader.style.opacity = "1";
    }

    // Quick section switch (500ms)
    setTimeout(() => {
      // Switch section
      sections.forEach((section) => section.classList.remove("active"));
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add("active");
        
        // Trigger data load for the section if needed
        loadSectionData(targetId);
      }

      // Hide preloader
      if (preloader) {
        preloader.classList.add("fade-out");
        setTimeout(() => {
          preloader.style.visibility = "hidden";
        }, 300);
      }
      
      // Update title
      document.title = "Diacare | " + targetId.charAt(0).toUpperCase() + targetId.slice(1);
    }, 500);
  });
});

// Load section-specific data dynamically
async function loadSectionData(sectionId) {
  switch(sectionId) {
    case 'dashboard':
      if (window.loadDashboardData) window.loadDashboardData();
      break;
    case 'analysis':
      if (window.initializeMealImageAnalysis) window.initializeMealImageAnalysis();
      break;
    case 'tips':
      import('./tips-loader.js').then(module => {
        module.loadDailyTips();
      }).catch(err => console.error('Failed to load tips:', err));
      break;
    case 'profile':
      import('./profile-loader.js').then(module => {
        module.loadProfileAnalysis();
      }).catch(err => console.error('Failed to load profile:', err));
      break;
    case 'reports':
      if (window.loadReports) window.loadReports();
      break;
  }
}