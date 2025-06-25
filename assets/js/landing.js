 function animateCountUp(elementId, target) {
  const el = document.getElementById(elementId)
  let count = 10

  const interval = setInterval(() => {
    // Random increment between 5 and 20
    const increment = Math.floor(Math.random() * 16) + 5

    if (count + increment >= target) {
      count = target
      clearInterval(interval)
    } else {
      count += increment
    }

    el.textContent = count + '+'
  }, 100) // Adjust speed here (lower = faster)
}

// Start counting once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  animateCountUp('diacare-count', 1520)
})
