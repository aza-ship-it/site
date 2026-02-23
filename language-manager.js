class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('siteLanguage') || 'fr';
        this.translations = translations; // Assumes translations.js is loaded
        this.init();
    }

    init() {
        this.applyLanguage(this.currentLang);
        this.createLanguageToggle();
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('siteLanguage', lang);
        this.applyLanguage(lang);
        this.updateToggleButton();
    }

    toggleLanguage() {
        const newLang = this.currentLang === 'fr' ? 'en' : 'fr';

        this.setLanguage(newLang);
    }

    applyLanguage(lang) {
        document.documentElement.lang = lang;

        // Translate elements with data-i18n
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[lang] && this.translations[lang][key]) {
                const translation = this.translations[lang][key];

                // Check if it's an input/textarea placeholder
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                }
                // For elements with HTML entities or tags (like &copy;)
                else if (translation.includes('&') || translation.includes('<')) {
                    element.innerHTML = translation;
                }
                // For regular text, use textContent for better performance
                else {
                    element.textContent = translation;
                }
            }
        });

        // Translate placeholders with data-i18n-placeholder
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (this.translations[lang] && this.translations[lang][key]) {
                element.placeholder = this.translations[lang][key];
            }
        });


    }

    createLanguageToggle() {
        // Check if controls already exist to prevent duplicates
        if (document.getElementById('headerControls')) return;

        // Create container for header controls
        const container = document.createElement('div');
        container.id = 'headerControls';
        container.className = 'header-controls';

        // Create Contact Button
        const contactBtn = document.createElement('a');
        contactBtn.id = 'contactBtn';
        contactBtn.className = 'contact-btn';
        contactBtn.href = '#';
        contactBtn.innerHTML = `
            <span class="contact-btn-text" data-i18n="contactBtnText">Me contacter</span>
            <span class="contact-btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
            </span>
        `;

        // Create Language Toggle Button
        const langBtn = document.createElement('button');
        langBtn.id = 'langToggle';
        langBtn.className = 'lang-toggle';
        langBtn.onclick = () => this.toggleLanguage();

        // Append buttons to container
        container.appendChild(contactBtn);
        container.appendChild(langBtn);

        // Detect home page (has canvas) vs sub-pages
        if (document.getElementById('scrollCanvas')) {
            container.classList.add('is-home');
        }

        // Insert container into body
        document.body.appendChild(container);
        this.updateToggleButton();
    }

    updateToggleButton() {
        const btn = document.getElementById('langToggle');
        if (btn) {
            // Show the OTHER language as the option to switch to
            // or show current. Let's show the current language code or a flag.
            // User asked for a button to switch. "FR | EN" style is common.
            // Let's make it look nice.
            btn.textContent = this.currentLang === 'fr' ? 'EN' : 'FR';
            btn.title = this.currentLang === 'fr' ? 'Switch to English' : 'Passer en Français';
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageManager);
} else {
    // DOM already loaded
    initLanguageManager();
}

function initLanguageManager() {
    window.languageManager = new LanguageManager();
}
