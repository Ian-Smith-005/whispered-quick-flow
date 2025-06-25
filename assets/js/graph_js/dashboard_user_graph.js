//all these are placeholders for the actual data, the actual data will be dynamically populated
// using a backend framework like Flask or Django
// Glucose Trend
      new Chart(document.getElementById("glucoseChart"), {
        type: "line",
        data: {
          labels: [
            "Jun 16",
            "Jun 17",
            "Jun 18",
            "Jun 19",
            "Jun 20",
            "Jun 21",
            "Jun 22",
          ],
          datasets: [
            {
              label: "Glucose (mg/dL)",
              data: [132, 125, 119, 114, 135, 118, 102],
              borderColor: "#20963b",
              backgroundColor: "rgba(32, 150, 59, 0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: { responsive: true },
      });

      // Weight Trend
      new Chart(document.getElementById("weightChart"), {
        type: "line",
        data: {
          labels: ["Jun 1", "Jun 8", "Jun 15", "Jun 22"],
          datasets: [
            {
              label: "Weight (lbs)",
              data: [172, 169, 167, 165],
              borderColor: "#20963b",
              backgroundColor: "rgba(32, 150, 59, 0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: { responsive: true },
      });

      // Blood Pressure
      new Chart(document.getElementById("bpChart"), {
        type: "line",
        data: {
          labels: ["Jun 1", "Jun 8", "Jun 15", "Jun 22"],
          datasets: [
            {
              label: "Systolic",
              data: [132, 128, 124, 120],
              borderColor: "#dc3545",
              backgroundColor: "rgba(220, 53, 69, 0.1)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Diastolic",
              data: [85, 83, 80, 78],
              borderColor: "#ffc107",
              backgroundColor: "rgba(255, 193, 7, 0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
      });


      new Chart(document.getElementById("glucoseChartdash"), {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Glucose (mg/dL)",
              data: [132, 125, 119, 114, 135, 118, 108],
              borderColor: "#20963b",
              backgroundColor: "rgba(32, 150, 59, 0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              suggestedMin: 80,
              suggestedMax: 160,
            },
          },
        },
      });
   
      // Weight trend (simple demo)
      new Chart(document.getElementById("weightChartdash"), {
        type: "line",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
          datasets: [
            {
              label: "Weight (lbs)",
              data: [172, 170, 169, 167, 165, 164],
              borderColor: "#007bff",
              backgroundColor: "rgba(0,123,255,0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
        },
      });

      // Blood Pressure trend
      new Chart(document.getElementById("bpChartdash"), {
        type: "bar",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          datasets: [
            {
              label: "Systolic",
              data: [120, 122, 118, 117, 121, 119],
              backgroundColor: "#dc3545",
            },
            {
              label: "Diastolic",
              data: [80, 78, 76, 77, 79, 78],
              backgroundColor: "#6c757d",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: "top" } },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 140,
            },
          },
        },
      });