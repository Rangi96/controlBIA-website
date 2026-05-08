// Translation System for Control BIA - Single Source of Truth Version
class TranslationSystem {
    constructor() {
        this.translations = {};
        this.currentLang = this.detectLanguage();
        this.defaultLang = 'en';
        this.englishContent = {};
        // Increments on every changeLanguage call so stale fetches can be ignored.
        this._langToken = 0;
        this.init();
    }

    detectLanguage() {
        const savedLang = localStorage.getItem('controlbia-lang');
        if (savedLang) return savedLang;
        const browserLang = navigator.language || '';
        return browserLang.toLowerCase().startsWith('es') ? 'es' : 'en';
    }

    async init() {
        this.storeEnglishContent();
        if (this.currentLang !== 'en') {
            await this.loadTranslations();
        }
        this.setupLanguageButtons();
        this.translatePage();
        this.updateActiveButton();
    }

    storeEnglishContent() {
        const elements = document.querySelectorAll('[data-translate]');

        elements.forEach(element => {
            const key = element.getAttribute('data-translate');

            let content;
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                content = element.placeholder;
            } else {
                content = element.textContent.trim();
            }

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

        this.englishContent.meta = { title: document.title };
    }

    async loadTranslations() {
        try {
            const response = await fetch(`translations/${this.currentLang}.json`);
            if (response.ok) {
                this.translations[this.currentLang] = await response.json();
            } else {
                throw new Error(`Failed to load ${this.currentLang}.json`);
            }
        } catch (error) {
            console.error('Translation load failed, using fallback:', error);
            this.translations = this.getFallbackTranslations();
        }
    }

    setupLanguageButtons() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.changeLanguage(lang);
            });
        });
    }

    async changeLanguage(lang) {
        const token = ++this._langToken;

        if (lang !== 'en' && !this.translations[lang]) {
            await this.loadTranslationForLanguage(lang);
            // A newer click landed while we were fetching — bail out so we don't
            // overwrite whatever the latest click already rendered.
            if (token !== this._langToken) return;
        }

        this.currentLang = lang;
        localStorage.setItem('controlbia-lang', lang);
        this.translatePage();
        this.updateActiveButton();
        document.documentElement.lang = lang;
    }

    async loadTranslationForLanguage(lang) {
        try {
            const response = await fetch(`translations/${lang}.json`);
            if (response.ok) {
                this.translations[lang] = await response.json();
            } else {
                throw new Error(`Failed to load ${lang}.json`);
            }
        } catch (error) {
            console.error(`Failed to load ${lang} translation:`, error);
            const fallback = this.getFallbackTranslations();
            if (fallback[lang]) {
                this.translations[lang] = fallback[lang];
            }
        }
    }

    updateActiveButton() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === this.currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    translatePage() {
        const elements = document.querySelectorAll('[data-translate]');

        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getTranslation(key);

            if (translation !== null) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        const titleTranslation = this.getTranslation('meta.title');
        if (titleTranslation) {
            document.title = titleTranslation;
        }
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value;

        if (this.currentLang === 'en') {
            value = this.englishContent;
            for (const k of keys) {
                if (value && value[k] !== undefined) {
                    value = value[k];
                } else {
                    return null;
                }
            }
            return value;
        }

        value = this.translations[this.currentLang];

        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                // Fall back to English when a key is missing in the active language.
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

    getFallbackTranslations() {
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
            }
        };
    }
}

function initTranslationSystem() {
    if (window.translationSystem) return;
    window.translationSystem = new TranslationSystem();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTranslationSystem);
} else {
    initTranslationSystem();
}
