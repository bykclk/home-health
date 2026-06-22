import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import tr from '@/locales/tr.json';

export const SUPPORTED_LANGUAGES = ['en', 'tr'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = 'app.language';

/** English is the default; Turkish only when the device asks for it. */
function deviceLanguage(): AppLanguage {
  const code = getLocales()[0]?.languageCode?.toLowerCase();
  return code === 'tr' ? 'tr' : 'en';
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, tr: { translation: tr } },
  lng: deviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

/** Apply a stored language preference, if any. Call once on startup. */
export async function loadStoredLanguage(): Promise<void> {
  try {
    const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as AppLanguage | null;
    if (saved && SUPPORTED_LANGUAGES.includes(saved) && saved !== i18n.language) {
      await i18n.changeLanguage(saved);
    }
  } catch {
    // Ignore storage errors and keep the device default.
  }
}

/** Change the active language and persist the choice. */
export async function setAppLanguage(lng: AppLanguage): Promise<void> {
  await i18n.changeLanguage(lng);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // Best-effort persistence.
  }
}

export default i18n;
