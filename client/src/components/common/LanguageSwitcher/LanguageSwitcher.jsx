import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_LANGUAGE,
  getSupportedLanguage,
  saveLanguagePreference,
} from "../../../i18n";
import "./LanguageSwitcher.css";

const LANGUAGE_OPTIONS = [
  {
    value: "en",
    labelKey: "nav.languageOptions.english",
    defaultLabel: "English",
  },
  {
    value: "es",
    labelKey: "nav.languageOptions.spanish",
    defaultLabel: "Spanish",
  },
  {
    value: "fr",
    labelKey: "nav.languageOptions.french",
    defaultLabel: "French",
  },
];

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const currentLanguage =
    getSupportedLanguage(i18n.resolvedLanguage || i18n.language) ||
    DEFAULT_LANGUAGE;

  const languageOptions = useMemo(
    () =>
      LANGUAGE_OPTIONS.map((option) => ({
        ...option,
        label: t(option.labelKey, {
          defaultValue: option.defaultLabel,
        }),
      })),
    [t],
  );

  const currentLanguageLabel =
    languageOptions.find((option) => option.value === currentLanguage)?.label ||
    t("nav.languageOptions.english", {
      defaultValue: "English",
    });

  useEffect(() => {
    saveLanguagePreference(currentLanguage);
  }, [currentLanguage]);

  const handleLanguageChange = (event) => {
    const selectedLanguage = saveLanguagePreference(event.target.value);

    // Updates visible translated text without refreshing the page.
    i18n.changeLanguage(selectedLanguage).catch(() => {});
  };

  return (
    <div className="language-switcher">
      <label htmlFor="language-select" className="language-switcher__label">
        {t("nav.language", {
          defaultValue: "Language",
        })}
      </label>

      <select
        id="language-select"
        className="language-switcher__select"
        value={currentLanguage}
        onChange={handleLanguageChange}
        aria-label={t("nav.selectLanguage", {
          defaultValue: "Select language",
        })}
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <span className="sr-only" aria-live="polite">
        {t("nav.currentLanguage", {
          defaultValue: "Current language: {{language}}",
          language: currentLanguageLabel,
        })}
      </span>
    </div>
  );
};

export default LanguageSwitcher;
