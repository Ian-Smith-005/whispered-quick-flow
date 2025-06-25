      const bubbleContainer = document.getElementById('bubbleContainer');
        const bubbleCount = 50; // Increased to 50 bubbles

        function createBubble() {
            const bubble = document.createElement('div');
            const size = Math.random() * 90 + 10; // Random size between 10px and 100px
            bubble.classList.add('bubble');
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${Math.random() * 100}vw`;
            bubble.style.animationDuration = `${Math.random() * 10 + 10}s`; // Slowed down to 10s-20s
            bubble.style.animationDelay = `${Math.random() * 10}s`; // Random delay up to 10s
            bubbleContainer.appendChild(bubble);

            // Remove bubble after animation to avoid clutter
            bubble.addEventListener('animationend', () => {
                bubble.remove();
                createBubble(); // Recreate a new bubble
            });
        }

        // Create initial bubbles
        for (let i = 0; i < bubbleCount; i++) {
            createBubble();
        }