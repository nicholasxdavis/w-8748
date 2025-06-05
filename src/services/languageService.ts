
export interface Language {
  code: string;
  name: string;
  flag: string;
  wikipediaPrefix: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', wikipediaPrefix: 'en' },
  { code: 'es', name: 'Español', flag: '🇪🇸', wikipediaPrefix: 'es' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', wikipediaPrefix: 'fr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', wikipediaPrefix: 'de' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', wikipediaPrefix: 'it' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', wikipediaPrefix: 'pt' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', wikipediaPrefix: 'ru' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', wikipediaPrefix: 'ja' },
  { code: 'zh', name: '中文', flag: '🇨🇳', wikipediaPrefix: 'zh' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', wikipediaPrefix: 'ko' },
];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0];

export const getCurrentLanguage = (): Language => {
  const savedLang = localStorage.getItem('selectedLanguage');
  if (savedLang) {
    const found = SUPPORTED_LANGUAGES.find(lang => lang.code === savedLang);
    if (found) return found;
  }
  return DEFAULT_LANGUAGE;
};

export const setCurrentLanguage = (languageCode: string): void => {
  localStorage.setItem('selectedLanguage', languageCode);
};

export const getLanguageByCode = (code: string): Language => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || DEFAULT_LANGUAGE;
};
