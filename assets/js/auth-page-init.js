// Initialize preloader and bubble background for auth pages

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

// Initialize on page load
window.addEventListener('load', () => {
  initPreloader();
  initBubbles();
});
