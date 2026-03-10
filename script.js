document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       Custom Interactive Cursor
       ========================================================================== */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const interactiveElements = document.querySelectorAll('.interactive-element, a, button, input');

    // Update cursor position
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Dot follows instantly
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Outline uses a subtle lag for a smooth trailing effect
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 150, fill: "forwards" });
    });

    // Add interactive hover state
    interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('hover');
        });
    });

    /* ==========================================================================
       Scroll Reveal Animations (IntersectionObserver)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const revealCallback = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once revealed if you only want it to happen once
                // observer.unobserve(entry.target);
            }
        });
    };

    const revealOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

    revealElements.forEach((el) => {
        revealObserver.observe(el);
    });

    /* ==========================================================================
       Scroll Video Logic
       ========================================================================== */
    const beyondSection = document.getElementById('beyond-screen');
    const scrollVideo1 = document.getElementById('scrollVideo1');
    const scrollVideo2 = document.getElementById('scrollVideo2');

    if (beyondSection && scrollVideo1 && scrollVideo2) {

        // Disable default playback, just in case
        scrollVideo1.pause();
        scrollVideo2.pause();

        const sectionHeader = beyondSection.querySelector('.section-header');
        const sideText = beyondSection.querySelector('.beyond-screen-text');

        const updateVideoProgress = () => {
            const headerRect = sectionHeader.getBoundingClientRect();
            const textRect = sideText.getBoundingClientRect();

            let progress = 0;
            const screenMiddle = window.innerHeight / 2;

            if (headerRect.top > screenMiddle) {
                progress = 0;
            } else if (textRect.top <= screenMiddle) {
                progress = 1;
            } else {
                const scrollDistance = textRect.top - headerRect.top;
                const scrolledPastStart = screenMiddle - headerRect.top;
                if (scrollDistance > 0) {
                    progress = scrolledPastStart / scrollDistance;
                } else {
                    progress = 1;
                }
            }

            // Clamp progress
            progress = Math.max(0, Math.min(1, progress));

            // Set current time based on progress

            // Timeline 2 starts immediately using base progress
            if (!isNaN(scrollVideo2.duration) && scrollVideo2.duration > 0) {
                scrollVideo2.currentTime = Math.min(scrollVideo2.duration * progress, scrollVideo2.duration - 0.01);
            }

            // Timeline 1 starts a bit later (delayed by 10% of the overall progress window)
            const delayOffset = 0.1;
            let video1Progress = 0;
            if (progress > delayOffset) {
                // scale the remaining 90% space to map from 0 to 1 for video 1
                video1Progress = (progress - delayOffset) / (1 - delayOffset);
            }

            if (!isNaN(scrollVideo1.duration) && scrollVideo1.duration > 0) {
                scrollVideo1.currentTime = Math.min(scrollVideo1.duration * video1Progress, scrollVideo1.duration - 0.01);
            }
        };

        window.addEventListener('scroll', () => {
            requestAnimationFrame(updateVideoProgress);
        });

        // Initialize state on load and resize
        window.addEventListener('resize', () => requestAnimationFrame(updateVideoProgress));

        // Videos might need to reach 'loadedmetadata' before duration is available
        scrollVideo1.addEventListener('loadedmetadata', updateVideoProgress);
        scrollVideo2.addEventListener('loadedmetadata', updateVideoProgress);

        // Fallback initial call
        requestAnimationFrame(updateVideoProgress);
    }
});
