import enTranslations from '../../i18n/en.json';
import thTranslations from '../../i18n/th.json';

export type Locale = 'en' | 'th';

const translations = {
  en: enTranslations,
  th: thTranslations,
} as const;

export function getTranslations(locale: Locale = 'th') {
  return translations[locale];
}

export function t(key: string, locale: Locale = 'th'): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

// Helper for client components
export function useTranslation(locale: Locale = 'th') {
  return {
    t: (key: string) => t(key, locale),
    translations: getTranslations(locale),
  };
}
