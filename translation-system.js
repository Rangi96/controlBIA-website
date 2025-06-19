// Translation System for Control BIA - DEBUG VERSION
class TranslationSystem {
    constructor() {
        console.log('🚀 TranslationSystem: Constructor called');
        this.translations = {};
        this.currentLang = this.detectLanguage();
        this.defaultLang = 'en';
        console.log('📍 Initial language detected:', this.currentLang);
        this.init();
    }

    // Detect browser language
    detectLanguage() {
        const savedLang = localStorage.getItem('controlbia-lang');
        if (savedLang) {
            console.log('💾 Found saved language:', savedLang);
            return savedLang;
        }

        const browserLang = navigator.language || navigator.userLanguage;
        const lang = browserLang.toLowerCase().startsWith('es') ? 'es' : 'en';
        console.log('🌐 Browser language:', browserLang, '→ Using:', lang);
        return lang;
    }

    // Initialize the translation system
    async init() {
        console.log('🔧 Initializing translation system...');
        await this.loadTranslations();
        this.setupLanguageButtons();
        this.translatePage();
        this.updateActiveButton();
        console.log('✅ Translation system initialized');
    }

    // Load translation files
    async loadTranslations() {
        console.log('📁 Loading translation files...');
        try {
            // Try with relative paths (no leading slash)
            const [enResponse, esResponse] = await Promise.all([
                fetch('translations/en.json'),
                fetch('translations/es.json')
            ]);

            console.log('📄 EN file status:', enResponse.status);
            console.log('📄 ES file status:', esResponse.status);

            this.translations.en = await enResponse.json();
            this.translations.es = await esResponse.json();
            
            console.log('✅ Translations loaded successfully');
            console.log('🔤 EN keys:', Object.keys(this.translations.en));
            console.log('🔤 ES keys:', Object.keys(this.translations.es));
        } catch (error) {
            console.error('❌ Error loading translations:', error);
            console.log('⚠️ Using fallback translations');
            // Fallback translations if files can't be loaded
            this.translations = this.getFallbackTranslations();
        }
    }

    // Setup language button click handlers
    setupLanguageButtons() {
        console.log('🔘 Setting up language buttons...');
        const langButtons = document.querySelectorAll('.lang-btn');
        console.log('🔘 Found language buttons:', langButtons.length);
        
        langButtons.forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            console.log('🔘 Adding click handler for:', lang);
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🖱️ Language button clicked:', lang);
                this.changeLanguage(lang);
            });
        });
    }

    // Change language
    changeLanguage(lang) {
        console.log('🔄 Changing language from', this.currentLang, 'to', lang);
        this.currentLang = lang;
        localStorage.setItem('controlbia-lang', lang);
        this.translatePage();
        this.updateActiveButton();
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        console.log('✅ Language changed to:', lang);
    }

    // Update active button state
    updateActiveButton() {
        console.log('🎨 Updating active button for language:', this.currentLang);
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === this.currentLang) {
                btn.classList.add('active');
                console.log('✅ Activated button:', btn.getAttribute('data-lang'));
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Translate the entire page
    translatePage() {
        console.log('📝 Translating page to:', this.currentLang);
        const elements = document.querySelectorAll('[data-translate]');
        console.log('📝 Found elements to translate:', elements.length);
        
        let translatedCount = 0;
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getTranslation(key);
            
            if (translation) {
                // Check if it's an input placeholder
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
                translatedCount++;
            } else {
                console.warn('⚠️ No translation found for key:', key);
            }
        });

        console.log('✅ Translated', translatedCount, 'out of', elements.length, 'elements');

        // Translate page title
        if (this.translations[this.currentLang]?.meta?.title) {
            document.title = this.translations[this.currentLang].meta.title;
            console.log('📄 Page title updated');
        }
    }

    // Get translation by key (supports nested keys like "nav.home")
    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                console.warn('❌ Translation not found for key:', key, 'in language:', this.currentLang);
                // Fallback to default language
                value = this.translations[this.defaultLang];
                for (const k2 of keys) {
                    if (value && value[k2] !== undefined) {
                        value = value[k2];
                    } else {
                        return null;
                    }
                }
                return value;
            }
        }
        
        return value;
    }

    // Fallback translations in case JSON files can't be loaded
    getFallbackTranslations() {
        console.log('🔄 Using fallback translations');
        return {
            en: {
                meta: {
                    title: "Control BIA - Visualization & Analytics"
                },
                nav: {
                    home: "Home",
                    about: "About",
                    services: "Services",
                    story: "Our Story",
                    dashboards: "Financial Intelligence",
                    getStarted: "Get Started"
                }
            },
            es: {
                meta: {
                    title: "Control BIA - Visualización y Análisis"
                },
                nav: {
                    home: "Inicio",
                    about: "Acerca de",
                    services: "Servicios",
                    story: "Nuestra Historia",
                    dashboards: "Inteligencia Financiera",
                    getStarted: "Comenzar"
                }
            }
        };
    }
}

// Initialize translation system when DOM is ready
console.log('📄 Translation script loaded, waiting for DOM...');
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, creating TranslationSystem...');
    window.translationSystem = new TranslationSystem();
});

// Also try direct initialization as backup
if (document.readyState === 'loading') {
    console.log('⏳ Document still loading...');
} else {
    console.log('📄 Document already loaded, initializing now...');
    window.translationSystem = new TranslationSystem();
}