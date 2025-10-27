window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  
  // Maximum 5 second preload, but hide as soon as content is ready
  let contentReady = false;
  const maxLoadTime = 5000;
  const startTime = Date.now();
  
  // Check if content is ready
  const checkContentReady = () => {
    // Check if DOM is fully loaded and scripts are ready
    if (document.readyState === 'complete') {
      contentReady = true;
      hidePreloader();
    }
  };
  
  const hidePreloader = () => {
    if (preloader && !preloader.classList.contains('fade-out')) {
      preloader.classList.add("fade-out");
      // Remove after fade animation completes
      setTimeout(() => {
        if (preloader) {
          preloader.style.display = "none";
        }
      }, 1000);
    }
  };
  
  // Hide immediately if content is already ready
  if (document.readyState === 'complete') {
    setTimeout(hidePreloader, 500); // Small delay for smooth experience
  } else {
    // Otherwise wait for content ready or max time
    document.addEventListener('readystatechange', checkContentReady);
    
    // Maximum 5 seconds regardless of loading state
    setTimeout(() => {
      hidePreloader();
    }, maxLoadTime);
  }
});