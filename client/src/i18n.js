import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

export const DEFAULT_LANGUAGE = "en";
export const LANGUAGE_STORAGE_KEY = "smarthireLanguage";
export const SUPPORTED_LANGUAGES = ["en", "es", "fr"];

const LEGACY_LANGUAGE_STORAGE_KEY = "i18nextLng";

export const getSupportedLanguage = (language) => {
  if (!language || typeof language !== "string") {
    return null;
  }

  const languageCode = language.toLowerCase().split("-")[0];

  return SUPPORTED_LANGUAGES.includes(languageCode) ? languageCode : null;
};

const getSavedLanguage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const legacyLanguage = window.localStorage.getItem(
      LEGACY_LANGUAGE_STORAGE_KEY,
    );

    return (
      getSupportedLanguage(savedLanguage) ||
      getSupportedLanguage(legacyLanguage)
    );
  } catch (error) {
    return null;
  }
};

const getBrowserLanguage = () => {
  if (typeof navigator === "undefined") {
    return null;
  }

  const browserLanguages =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  return browserLanguages.map(getSupportedLanguage).find(Boolean) || null;
};

export const getInitialLanguage = () => {
  return getSavedLanguage() || getBrowserLanguage() || DEFAULT_LANGUAGE;
};

export const saveLanguagePreference = (language) => {
  const supportedLanguage = getSupportedLanguage(language) || DEFAULT_LANGUAGE;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, supportedLanguage);

      // Keeps compatibility with older i18next language storage.
      window.localStorage.setItem(
        LEGACY_LANGUAGE_STORAGE_KEY,
        supportedLanguage,
      );
    } catch (error) {
      // The app can still run if localStorage is blocked by the browser.
    }
  }

  if (typeof document !== "undefined") {
    document.documentElement.lang = supportedLanguage;
  }

  return supportedLanguage;
};

const initialLanguage = saveLanguagePreference(getInitialLanguage());

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: initialLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    load: "languageOnly",
    nonExplicitSupportedLngs: true,

    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

i18n.on("languageChanged", (language) => {
  saveLanguagePreference(language);
});

export default i18n;
