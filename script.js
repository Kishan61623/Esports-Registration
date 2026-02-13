// =============================================
// PREMIUM ESPORTS TOURNAMENT - ENHANCED SCRIPT
// =============================================

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeParticles();
    initializeAOS();
    initializeNavigation();
    initializeCountdown();
    initializeFormValidation();
    initializeScrollEffects();
    initializeMobileMenu();
    hideLoadingScreen();
});

// ========== PARTICLES BACKGROUND ==========
function initializeParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#00bfff'
                },
                shape: {
                    type: 'circle'
                },
                opacity: {
                    value: 0.5,
                    random: true
                },
                size: {
                    value: 3,
                    random: true
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#00bfff',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }
}

// ========== ANIMATION ON SCROLL (AOS) ==========
function initializeAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
}

// ========== LOADING SCREEN ==========
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1000);
}

// ========== NAVIGATION SYSTEM ==========
function initializeNavigation() {
    const navLinks = document.querySelectorAll('nav ul li a');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-page');

            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show target page with animation
            showPage(targetId);

            // Close mobile menu if open
            closeMobileMenu();

            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Show default page
    showPage('tournament-info');
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');

    pages.forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');

        // Refresh AOS animations for new page
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }
}

// Global function for navigation (used by buttons)
window.navigateToPage = function(pageId) {
    showPage(pageId);

    // Update nav active state
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ========== MOBILE MENU ==========
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('main-nav');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }
}

function closeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('main-nav');

    if (mobileMenuBtn) {
        mobileMenuBtn.classList.remove('active');
        nav.classList.remove('active');
    }
}

// ========== COUNTDOWN TIMER ==========
function initializeCountdown() {
    const countdownElement = document.getElementById('countdown-timer');
    if (!countdownElement) return;

    // Tournament date: Feb 20, 2026, 18:00 IST
    const tournamentDate = new Date('2026-02-20T18:00:00+05:30').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = tournamentDate - now;

        if (distance < 0) {
            countdownElement.innerHTML = '🎮 Tournament Live!';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ========== FORM VALIDATION & SUBMISSION ==========
function initializeFormValidation() {
    const registrationForm = document.getElementById('registrationForm');
    if (!registrationForm) return;

    const submitBtn = registrationForm.querySelector('.submit-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');

    // Real-time validation
    const inputs = registrationForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateInput(input);
        });

        input.addEventListener('blur', () => {
            validateInput(input);
        });
    });

    // Form submission
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all inputs
        let isValid = true;
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            showToast('❌ Please fix the errors before submitting', 'error');
            return;
        }

        // Prepare form data
        const formData = {
            teamName: document.getElementById('teamName').value.trim(),
            teamCaptain: document.getElementById('teamCaptain').value.trim(),
            mobileNumber: document.getElementById('mobileNumber').value.trim()
        };

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        progressContainer.classList.add('active');

        // Animate progress bar
        animateProgressBar(progressBar);

        try {
            // Add timeout handling
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch('https://esports-registration.onrender.com/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Success! Complete progress bar
            progressBar.style.width = '100%';

            // Show success message
            showToast('✅ Registration Successful!', 'success');

            // Reset form and show success page
            setTimeout(() => {
                registrationForm.reset();
                showPage('success-page');

                // Reset button state
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                progressContainer.classList.remove('active');
                progressBar.style.width = '0';
            }, 1000);

        } catch (error) {
            // Handle errors
            progressBar.style.width = '0';
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            progressContainer.classList.remove('active');

            let errorMessage = 'Registration failed. Please try again.';

            if (error.name === 'AbortError') {
                errorMessage = '⏱️ Request timeout. Please check your connection and try again.';
            } else if (error.message.includes('Team Name') || error.message.includes('Mobile Number')) {
                errorMessage = `❌ ${error.message}`;
            } else if (error.message === 'Failed to fetch') {
                errorMessage = '🌐 Network error. Please check your internet connection.';
            } else {
                errorMessage = `❌ ${error.message}`;
            }

            showToast(errorMessage, 'error');
            console.error('Registration error:', error);
        }
    });
}

// ========== INPUT VALIDATION ==========
function validateInput(input) {
    const errorElement = document.getElementById(`${input.id}-error`);
    let isValid = true;
    let errorMessage = '';

    // Check if empty
    if (input.value.trim() === '') {
        isValid = false;
        errorMessage = 'This field is required';
    }
    // Validate mobile number
    else if (input.id === 'mobileNumber') {
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(input.value.trim())) {
            isValid = false;
            errorMessage = 'Please enter a valid 10-digit mobile number';
        }
    }
    // Validate team name (min 3 characters)
    else if (input.id === 'teamName') {
        if (input.value.trim().length < 3) {
            isValid = false;
            errorMessage = 'Team name must be at least 3 characters';
        }
    }
    // Validate captain name (min 3 characters)
    else if (input.id === 'teamCaptain') {
        if (input.value.trim().length < 3) {
            isValid = false;
            errorMessage = 'Captain name must be at least 3 characters';
        }
    }

    // Display error
    if (errorElement) {
        errorElement.textContent = errorMessage;
    }

    // Visual feedback
    if (!isValid) {
        input.style.borderColor = '#ff4444';
    } else {
        input.style.borderColor = 'var(--primary-blue)';
    }

    return isValid;
}

// ========== PROGRESS BAR ANIMATION ==========
function animateProgressBar(progressBar) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        if (progress > 90) {
            clearInterval(interval);
            return;
        }
        progressBar.style.width = progress + '%';
    }, 200);
}

// ========== TOAST NOTIFICATION ==========
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.add('show');

    // Change color based on type
    if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, #ff4444, #cc0000)';
    } else {
        toast.style.background = 'linear-gradient(135deg, #00ff88, #00cc6a)';
    }

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ========== SCROLL EFFECTS ==========
function initializeScrollEffects() {
    const scrollTopBtn = document.getElementById('scroll-top-btn');

    // Show/hide scroll-to-top button
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    // Scroll to top on click
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========== DYNAMIC TEAM SLOTS (OPTIONAL) ==========
// Update team slots dynamically if you have an API endpoint
function updateTeamSlots() {
    const teamSlotsElement = document.getElementById('team-slots');
    if (!teamSlotsElement) return;

    // Example: Fetch from API
    // fetch('/api/team-count')
    //     .then(res => res.json())
    //     .then(data => {
    //         teamSlotsElement.textContent = `${data.registered}/${data.total}`;
    //     });

    // For now, using static value
    teamSlotsElement.textContent = '48/64';
}

// Call on page load
updateTeamSlots();

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
});

// ========== PERFORMANCE MONITORING ==========
window.addEventListener('load', () => {
    // Log page load time for monitoring
    const loadTime = window.performance.timing.domContentLoadedEventEnd -
        window.performance.timing.navigationStart;
    console.log(`⚡ Page loaded in ${loadTime}ms`);
});

// ========== ERROR HANDLING ==========
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
