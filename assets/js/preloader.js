      window.addEventListener("load", () => {
        const preloader = document.getElementById("preloader");
        const mainContent = document.getElementById("main-content");

        // Wait 5 seconds then fade out
        setTimeout(() => {
          preloader.classList.add("fade-out");

          // Remove it completely after fade animation (1s)
          setTimeout(() => {
            preloader.style.display = "none";
            mainContent.style.display = "block";
          }, 1000);
        }, 5000);
      });