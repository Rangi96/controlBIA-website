// Translation System for Control BIA - Single Source of Truth Version
class TranslationSystem {
    constructor() {
        console.log('🚀 TranslationSystem: Constructor called');
        this.translations = {};
        this.currentLang = this.detectLanguage();
        this.defaultLang = 'en';
        
        // Store original English content from HTML
        this.englishContent = {};
        
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
        
        // First, store all English content from HTML
        this.storeEnglishContent();
        
        // Only load non-English translations
        if (this.currentLang !== 'en') {
            await this.loadTranslations();
        }
        
        this.setupLanguageButtons();
        this.translatePage();
        this.updateActiveButton();
        console.log('✅ Translation system initialized');
    }

    // Store original English content from HTML elements
    storeEnglishContent() {
        console.log('📝 Storing English content from HTML...');
        const elements = document.querySelectorAll('[data-translate]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            
            // Get the content based on element type
            let content;
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                content = element.placeholder;
            } else {
                content = element.textContent.trim();
            }
            
            // Store using nested object structure
            const keys = key.split('.');
            let current = this.englishContent;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = content;
        });
        
        // Store page title
        this.englishContent.meta = { title: document.title };
        
        console.log('✅ English content stored:', this.englishContent);
    }

    // Load translation files (only non-English)
    async loadTranslations() {
        console.log('📁 Loading translation files...');
        try {
            // Only load the current non-English language
            const response = await fetch(`translations/${this.currentLang}.json`);
            
            console.log(`📄 ${this.currentLang.toUpperCase()} file status:`, response.status);
            
            if (response.ok) {
                this.translations[this.currentLang] = await response.json();
                console.log('✅ Translations loaded successfully');
            } else {
                throw new Error(`Failed to load ${this.currentLang}.json`);
            }
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
            
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('🖱️ Language button clicked:', lang);
                await this.changeLanguage(lang);
            });
        });
    }

    // Change language
    async changeLanguage(lang) {
        console.log('🔄 Changing language from', this.currentLang, 'to', lang);
        
        // If switching to a non-English language that hasn't been loaded yet
        if (lang !== 'en' && !this.translations[lang]) {
            await this.loadTranslationForLanguage(lang);
        }
        
        this.currentLang = lang;
        localStorage.setItem('controlbia-lang', lang);
        this.translatePage();
        this.updateActiveButton();
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        console.log('✅ Language changed to:', lang);
    }

    // Load a specific language translation
    async loadTranslationForLanguage(lang) {
        console.log(`📁 Loading ${lang} translation...`);
        try {
            const response = await fetch(`translations/${lang}.json`);
            if (response.ok) {
                this.translations[lang] = await response.json();
                console.log(`✅ ${lang} translation loaded`);
            } else {
                throw new Error(`Failed to load ${lang}.json`);
            }
        } catch (error) {
            console.error(`❌ Error loading ${lang} translation:`, error);
            // Use fallback if available
            const fallback = this.getFallbackTranslations();
            if (fallback[lang]) {
                this.translations[lang] = fallback[lang];
            }
        }
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
            
            if (translation !== null) {
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
        const titleTranslation = this.getTranslation('meta.title');
        if (titleTranslation) {
            document.title = titleTranslation;
            console.log('📄 Page title updated');
        }
    }

    // Get translation by key (supports nested keys like "nav.home")
    getTranslation(key) {
        const keys = key.split('.');
        let value;
        
        // If current language is English, use stored English content
        if (this.currentLang === 'en') {
            value = this.englishContent;
            for (const k of keys) {
                if (value && value[k] !== undefined) {
                    value = value[k];
                } else {
                    console.warn('❌ English content not found for key:', key);
                    return null;
                }
            }
            return value;
        }
        
        // For other languages, use loaded translations
        value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                console.warn('❌ Translation not found for key:', key, 'in language:', this.currentLang);
                
                // Fallback to English content
                value = this.englishContent;
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
                },
                hero: {
                    title: "Transforme los Datos Financieros en Decisiones Estratégicas",
                    subtitle: "Combinamos servicios expertos de contabilidad con inteligencia empresarial de vanguardia para ayudar a las empresas no solo a cumplir con sus obligaciones financieras, sino a descubrir oportunidades de crecimiento y optimización.",
                    cta1: "Comience Su Transformación",
                    cta2: "Más Información"
                }
                // ... add more fallback translations as needed
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
