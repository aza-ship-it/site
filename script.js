// ========================================
// CONFIGURATION
// ========================================

const CONFIG = {
    FRAME_COUNT: 192,
    FRAME_FOLDER: './sequence/',
    CANVAS_WIDTH: window.innerWidth,
    CANVAS_HEIGHT: window.innerHeight
};

// ========================================
// STATE
// ========================================

let state = {
    isLoading: true,
    imagesLoaded: 0,
    currentFrame: 0,
    scrollProgress: 0,
    images: [],  // Use array instead of Map for simpler access
    devicePixelRatio: window.devicePixelRatio || 1
};

// ========================================
// DOM ELEMENTS
// ========================================

const canvas = document.getElementById('scrollCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const loadingScreen = document.getElementById('loadingScreen');
const loadingProgress = document.getElementById('loadingProgress');
const loadingPercent = document.getElementById('loadingPercent');
const welcomeIntro = document.getElementById('welcomeIntro');

// Navigation Elements
const mainNav = document.getElementById('mainNav');
const navMenuBtn = document.getElementById('navMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const backToTop = document.getElementById('backToTop');

// ========================================
// NAVIGATION & BACK TO TOP
// ========================================

function initNavigation() {
    // Mobile menu toggle
    if (navMenuBtn && mobileMenu) {
        navMenuBtn.addEventListener('click', () => {
            navMenuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close mobile menu when clicking a link
        mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Back to top button
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function updateNavOnScroll() {
    const scrollTop = window.scrollY;

    // Nav background on scroll
    if (mainNav) {
        if (scrollTop > 100) {
            mainNav.classList.add('scrolled');
        } else {
            mainNav.classList.remove('scrolled');
        }
    }

    // Back to top visibility
    if (backToTop) {
        if (scrollTop > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
}

// ========================================
// CANVAS SETUP
// ========================================

function setupCanvas() {
    if (!canvas || !ctx) {
        return;
    }

    const dpr = state.devicePixelRatio;
    canvas.width = CONFIG.CANVAS_WIDTH * dpr;
    canvas.height = CONFIG.CANVAS_HEIGHT * dpr;
    canvas.style.width = CONFIG.CANVAS_WIDTH + 'px';
    canvas.style.height = CONFIG.CANVAS_HEIGHT + 'px';

    ctx.scale(dpr, dpr);

    // Clear with background color
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);


}

// ========================================
// IMAGE PRELOADING
// ========================================

function preloadImages() {
    return new Promise((resolve) => {
        state.images = new Array(CONFIG.FRAME_COUNT);
        let loaded = 0;



        for (let i = 0; i < CONFIG.FRAME_COUNT; i++) {
            const frameNum = String(i).padStart(3, '0');
            const imagePath = `${CONFIG.FRAME_FOLDER}frame_${frameNum}_delay-0.042s.jpg`;

            const img = new Image();

            img.onload = () => {
                state.images[i] = img;
                loaded++;
                state.imagesLoaded = loaded;
                updateLoadingProgress(loaded);

                if (loaded === CONFIG.FRAME_COUNT) {
                    state.isLoading = false;

                    resolve();
                }
            };

            img.onerror = () => {

                loaded++;
                state.imagesLoaded = loaded;
                updateLoadingProgress(loaded);

                if (loaded === CONFIG.FRAME_COUNT) {
                    state.isLoading = false;

                    resolve();
                }
            };

            // IMPORTANT: Assign src to trigger the load
            img.src = imagePath;
        }

        // Timeout failsafe
        setTimeout(() => {
            if (state.isLoading) {

                state.isLoading = false;
                resolve();
            }
        }, 30000); // 30 second timeout
    });
}

function updateLoadingProgress(loaded) {
    const percent = Math.round((loaded / CONFIG.FRAME_COUNT) * 100);
    if (loadingProgress) loadingProgress.style.width = percent + '%';
    if (loadingPercent) loadingPercent.textContent = percent + '%';
}

// ========================================
// CANVAS RENDERING
// ========================================

function renderFrame() {
    if (!ctx) {

        return;
    }

    if (state.isLoading) {
        return;
    }

    if (state.images.length === 0) {

        return;
    }

    const frameIndex = Math.floor(state.currentFrame);
    const img = state.images[frameIndex];

    if (!img) {

        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        return;
    }

    // Check if image is actually loaded
    if (!img.complete || !img.naturalWidth) {

        return;
    }

    const canvasWidth = canvas.width / state.devicePixelRatio;
    const canvasHeight = canvas.height / state.devicePixelRatio;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
        drawHeight = canvasHeight;
        drawWidth = drawHeight * imgRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
    } else {
        drawWidth = canvasWidth;
        drawHeight = drawWidth / imgRatio;
        offsetX = 0;
        offsetY = (canvasHeight - drawHeight) / 2;
    }

    // Clear canvas
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw image
    try {
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    } catch (e) {
    }
}

function animate() {
    renderFrame();
    requestAnimationFrame(animate);
}

// ========================================
// SCROLL MANAGEMENT
// ========================================

function handleScroll() {
    const scrollTop = window.scrollY;

    // Get the actual hero section element to measure its real height
    const heroSection = document.querySelector('.hero');
    const canvasSection = document.querySelector('.canvas-section');

    if (!heroSection || !canvasSection) {
        return;
    }

    const heroHeight = heroSection.offsetHeight;
    const canvasSectionHeight = canvasSection.offsetHeight;
    const canvasStartScroll = heroHeight;

    // Calculate which frame we should be on
    if (scrollTop >= canvasStartScroll && scrollTop <= (canvasStartScroll + canvasSectionHeight)) {
        // We are in the canvas scroll section
        const scrollInCanvas = scrollTop - canvasStartScroll;
        const progress = scrollInCanvas / canvasSectionHeight;  // 0 to 1

        // Map progress to frame index
        const newFrame = progress * (CONFIG.FRAME_COUNT - 1);
        state.currentFrame = newFrame;
    } else if (scrollTop < canvasStartScroll) {
        // Before canvas section
        state.currentFrame = 0;
    } else {
        // After canvas section
        state.currentFrame = CONFIG.FRAME_COUNT - 1;
    }

    // Hide welcome intro on scroll
    if (scrollTop > 50 && welcomeIntro) {
        welcomeIntro.style.opacity = '0';
        welcomeIntro.style.pointerEvents = 'none';
    }

    // Update navigation on scroll
    updateNavOnScroll();
}

// ========================================
// LOADING COMPLETION
// ========================================

function hideLoadingScreen() {
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            // Reapply translations after loading screen is hidden
            if (window.languageManager) {
                window.languageManager.applyLanguage(window.languageManager.currentLang);
            }
        }, 600);
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function attachEventListeners() {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
        // Optionally update canvas on resize
        setupCanvas();
    }, { passive: true });
}

// ========================================
// CONTACT MODAL
// ========================================

function initContactModal() {
    let contactModal = document.getElementById('contactModal');

    // If the modal doesn't exist in the page (sub-pages), inject it dynamically
    if (!contactModal) {
        const modalHTML = `
        <div class="contact-modal" id="contactModal">
            <div class="contact-modal-overlay" id="contactModalOverlay"></div>
            <div class="contact-modal-content">
                <button class="contact-modal-close" id="contactModalClose" aria-label="Fermer">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div class="contact-modal-header">
                    <h2 data-i18n="modalContactTitle">Me Contacter</h2>
                    <p data-i18n="modalContactSubtitle">Décrivez votre projet ou votre demande</p>
                </div>
                <form class="contact-form" id="contactForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="contactName" data-i18n="formLabelName">Nom complet *</label>
                            <input type="text" id="contactName" name="name" required data-i18n-placeholder="formPlaceholderName">
                        </div>
                        <div class="form-group">
                            <label for="contactEmail" data-i18n="formLabelEmail">Adresse Email *</label>
                            <input type="email" id="contactEmail" name="email" required data-i18n-placeholder="formPlaceholderEmail">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="contactPhone" data-i18n="formLabelPhone">Téléphone *</label>
                            <input type="tel" id="contactPhone" name="phone" required data-i18n-placeholder="formPlaceholderPhone">
                        </div>
                        <div class="form-group">
                            <label for="contactCompany" data-i18n="formLabelCompany">Entreprise / École</label>
                            <input type="text" id="contactCompany" name="company" data-i18n-placeholder="formPlaceholderCompany">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="contactSubject" data-i18n="formLabelSubject">Objet de la demande *</label>
                        <div class="custom-select" id="customSelect">
                            <div class="custom-select-trigger" id="customSelectTrigger">
                                <span class="custom-select-value" data-i18n="formOptionSelect">Sélectionnez une option</span>
                                <svg class="custom-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                            <div class="custom-select-options" id="customSelectOptions">
                                <div class="custom-option" data-value="project" data-i18n="formOptionProject">Projet</div>
                                <div class="custom-option" data-value="internship" data-i18n="formOptionInternship">Stage</div>
                                <div class="custom-option" data-value="alternance" data-i18n="formOptionAlternance">Alternance</div>
                                <div class="custom-option" data-value="other" data-i18n="formOptionOther">Autre</div>
                            </div>
                            <input type="hidden" name="subject" id="contactSubject" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="contactMessage" data-i18n="formLabelMessage">Message *</label>
                        <textarea id="contactMessage" name="message" rows="5" required data-i18n-placeholder="formPlaceholderMessage"></textarea>
                    </div>
                    <button type="submit" class="form-submit-btn">
                        <span data-i18n="formButtonSubmit">Envoyer</span>
                    </button>
                </form>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        contactModal = document.getElementById('contactModal');

        // Re-init custom select for the injected modal
        initCustomSelect();

        // Apply translations if language manager is available
        if (window.languageManager) {
            window.languageManager.applyLanguage(window.languageManager.currentLang);
        }
    }

    const contactModalOverlay = document.getElementById('contactModalOverlay');
    const contactModalClose = document.getElementById('contactModalClose');
    const contactForm = document.getElementById('contactForm');

    // Open modal
    function openModal(e) {
        e.preventDefault();
        e.stopPropagation();
        contactModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Close modal
    function closeModal() {
        contactModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Use event delegation on document to catch clicks on dynamically created button
    document.addEventListener('click', (e) => {
        const contactBtn = e.target.closest('#contactBtn, .contact-btn');
        if (contactBtn) {
            openModal(e);
        }
    });

    // Close modal event listeners
    if (contactModalClose) {
        contactModalClose.addEventListener('click', closeModal);
    }
    if (contactModalOverlay) {
        contactModalOverlay.addEventListener('click', closeModal);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && contactModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Form submission
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Basic email validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(data.email)) {
                alert('Veuillez entrer une adresse email valide.');
                return;
            }

            // Here you would normally send the data to a server


            // Create mailto link as fallback
            const subject = encodeURIComponent(`Contact: ${data.subject}`);
            const body = encodeURIComponent(
                `Nom: ${data.name}\n` +
                `Email: ${data.email}\n` +
                `Téléphone: ${data.phone}\n` +
                `Entreprise/École: ${data.company || 'N/A'}\n` +
                `Objet: ${data.subject}\n\n` +
                `Message:\n${data.message}`
            );

            window.location.href = `mailto:penin.clement@hotmail.com?subject=${subject}&body=${body}`;

            // Close modal and reset form
            closeModal();
            contactForm.reset();
        });
    }
}


// ========================================
// CUSTOM SELECT DROPDOWN
// ========================================

function initCustomSelect() {
    const customSelect = document.getElementById('customSelect');
    if (!customSelect) return;

    const trigger = customSelect.querySelector('.custom-select-trigger');
    const options = customSelect.querySelectorAll('.custom-option');
    const hiddenInput = customSelect.querySelector('input[type="hidden"]');
    const valueDisplay = customSelect.querySelector('.custom-select-value');

    // Add placeholder class initially
    valueDisplay.classList.add('placeholder');

    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        customSelect.classList.toggle('open');
    });

    // Select an option
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();

            // Remove selected class from all
            options.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');

            // Update display and hidden input
            valueDisplay.textContent = option.textContent;
            valueDisplay.classList.remove('placeholder');
            hiddenInput.value = option.dataset.value;

            // Close dropdown
            customSelect.classList.remove('open');
        });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });

    // Reset support
    const form = customSelect.closest('form');
    if (form) {
        form.addEventListener('reset', () => {
            setTimeout(() => {
                const defaultText = valueDisplay.getAttribute('data-i18n');
                const lang = document.documentElement.lang || 'fr';
                if (window.languageManager && window.languageManager.translations[lang] && window.languageManager.translations[lang][defaultText]) {
                    valueDisplay.textContent = window.languageManager.translations[lang][defaultText];
                } else {
                    valueDisplay.textContent = 'Sélectionnez une option';
                }
                valueDisplay.classList.add('placeholder');
                hiddenInput.value = '';
                options.forEach(o => o.classList.remove('selected'));
            }, 0);
        });
    }
}

// ========================================
// CUSTOM PRECISION CURSOR
// ========================================



// ========================================
// SCROLL-REVEAL OBSERVER
// ========================================

function initScrollReveal() {
    // Mark elements for reveal
    const revealSelectors = [
        '.section-header',
        '.about-grid',
        '.about-timeline-section',
        '.hub-title',
        '.contact-section',
        '.contact-container',
        '.split-section',
        '.category-selection',
        '.footer'
    ];

    revealSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            el.classList.add('reveal');
        });
    });

    // Mark grids for stagger effect
    const staggerSelectors = [
        '.hub-grid',
        '.projects-grid',
        '.interests-grid',
        '.skills-grid'
    ];

    staggerSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            el.classList.add('reveal-stagger');
        });
    });

    // Observe
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Once only
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
        observer.observe(el);
    });
}

// ========================================
// PAGE TRANSITION
// ========================================

function initPageTransitions() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('page-transition-overlay');
    document.body.appendChild(overlay);

    // Intercept internal link clicks
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');

        // Skip external, hash, mailto, tel, download, target=_blank
        if (!href) return;
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (href.startsWith('http') && !href.includes(window.location.hostname)) return;
        if (link.hasAttribute('target') && link.getAttribute('target') === '_blank') return;
        if (link.hasAttribute('download')) return;

        // It's an internal page navigation
        e.preventDefault();
        overlay.classList.add('active');

        setTimeout(() => {
            window.location.href = href;
        }, 420);
    });
}

// ========================================
// HUB CARD GLOW TRACKING
// ========================================

function initCardGlow() {
    document.querySelectorAll('.hub-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--glow-x', x + 'px');
            card.style.setProperty('--glow-y', y + 'px');
        });
    });
}

// ========================================
// INITIALIZATION
// ========================================

async function init() {
    setupCanvas();
    initNavigation();
    initContactModal();
    initCustomSelect();

    initPageTransitions();
    initCardGlow();

    try {
        await preloadImages();

        hideLoadingScreen();

        // Check for hash and handle instant scroll
        if (window.location.hash) {
            // Disable smooth scrolling temporarily
            document.documentElement.style.scrollBehavior = 'auto';
            document.body.style.scrollBehavior = 'auto';

            // Scroll to the element
            const target = document.querySelector(window.location.hash);
            if (target) {
                target.scrollIntoView({ behavior: 'auto', block: 'start' });
            }

            // Re-enable smooth scrolling after a short delay
            setTimeout(() => {
                document.documentElement.style.scrollBehavior = '';
                document.body.style.scrollBehavior = '';
            }, 100);
        }

        // Only show welcome on first visit (not when returning from subpages)
        if (sessionStorage.getItem('welcomeShown')) {
            if (welcomeIntro) {
                welcomeIntro.style.display = 'none';
            }
        } else {
            sessionStorage.setItem('welcomeShown', 'true');
        }

        attachEventListeners();
        animate();
        initScrollReveal();
    } catch (error) {
        if (loadingScreen) {
            loadingScreen.innerHTML = '<p style="color: rgba(255,255,255,0.6);">Error loading. Please refresh.</p>';
        }
    }
}

// Initialize for sub-pages (no canvas)
function initSubPage() {
    initNavigation();
    initContactModal();

    initScrollReveal();
    initPageTransitions();
    initCardGlow();

    // Handle scroll for nav and back to top on sub-pages
    window.addEventListener('scroll', () => {
        updateNavOnScroll();
    }, { passive: true });

    // Initial check
    updateNavOnScroll();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (canvas) {
            init();
        } else {
            initSubPage();
        }
    });
} else {
    if (canvas) {
        init();
    } else {
        initSubPage();
    }
}

// Cleanup
window.addEventListener('beforeunload', () => {
    window.removeEventListener('scroll', handleScroll);
});