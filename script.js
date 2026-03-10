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
       Agent Chat Assistant Logic
       ========================================================================== */
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatHistory = document.getElementById('chatHistory');

    // Simulated Bot Responses
    const botResponses = [
        "That's an excellent question. Orion specializes in bridging the gap between rigorous QA and creative strategy.",
        "Based on his background, Orion utilizes highly analytical approaches to ensure digital campaigns perform flawlessly.",
        "You'll find that 'UI/UX Pro Max' principles guide his design thinking: maximizing aesthetics without sacrificing performance.",
        "I can tell you that his multi-cultural marketing insights have shaped comprehensive engagement strategies across diverse markets.",
        "Let me know if you want to explore the specific technical tools he uses, or read his recent LinkedIn feature."
    ];

    const createMessageElement = (content, isUser = false) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = isUser ? 'You' : 'AI';

        const textContent = document.createElement('div');
        textContent.className = 'message-content';
        textContent.textContent = content;

        msgDiv.appendChild(avatar);
        msgDiv.appendChild(textContent);

        return msgDiv;
    };

    const createTypingIndicator = () => {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message typing-indicator-container';
        typingDiv.id = 'typingIndicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = 'AI';

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(indicator);

        return typingDiv;
    };

    const handleSendMessage = () => {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message
        const userMsg = createMessageElement(text, true);
        chatHistory.appendChild(userMsg);
        chatInput.value = '';
        scrollToBottom();

        // Simulate agent processing & typing
        const typingIndicator = createTypingIndicator();
        setTimeout(() => {
            chatHistory.appendChild(typingIndicator);
            scrollToBottom();
        }, 300); // Small delay before typing appears

        // Send request to Vercel Serverless Function
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text })
        })
            .then(response => response.json())
            .then(data => {
                // Remove typing indicator
                const currentIndicator = document.getElementById('typingIndicator');
                if (currentIndicator) {
                    currentIndicator.remove();
                }

                // Extract response from common API structures
                const reply = data.response || data.reply || data.message || data.answer || "Message received.";
                const botMsg = createMessageElement(reply, false);
                chatHistory.appendChild(botMsg);
                scrollToBottom();
            })
            .catch(error => {
                // Remove typing indicator
                const currentIndicator = document.getElementById('typingIndicator');
                if (currentIndicator) {
                    currentIndicator.remove();
                }

                console.error('API Connection Error:', error);
                const errMsg = createMessageElement("Connection failed.", false);
                chatHistory.appendChild(errMsg);
                scrollToBottom();
            });
    };

    const scrollToBottom = () => {
        // Smooth scroll to the bottom of the chat history
        chatHistory.scrollTo({
            top: chatHistory.scrollHeight,
            behavior: 'smooth'
        });
    };

    // Event Listeners for Chat
    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
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
