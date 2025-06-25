      const links = document.querySelectorAll("[data-target]");
      const sections = document.querySelectorAll(".content-section");
      const preloader = document.getElementById("sectionPreloader");

      //  Show preloader on initial page load (5s)
      window.addEventListener("load", () => {
        setTimeout(() => {
          preloader.classList.add("fade-out");
        }, 2000);
      });

      //  Reusable preloader for section navigation (2s)
      links.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const targetId = link.getAttribute("data-target");

          // Update active nav link
          links.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");

          // Reset preloader
          preloader.classList.remove("fade-out");
          preloader.style.visibility = "visible";
          preloader.style.opacity = "1";

          // Show preloader for 2s before changing section
          setTimeout(() => {
            // Switch section
            sections.forEach((section) => section.classList.remove("active"));
            document.getElementById(targetId).classList.add("active");

            // Fade out preloader
            preloader.classList.add("fade-out");
            preloader.style.visibility = "hidden";
            // Update title
            document.title =
              "Diacare | " +
              targetId.charAt(0).toUpperCase() +
              targetId.slice(1);
          }, 2000);
        });
      });