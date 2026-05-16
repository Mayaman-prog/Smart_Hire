import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.resolvedLanguage || i18n.language || "en";

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div className="language-switcher">
      <label htmlFor="language-select" className="language-switcher__label">
        {t("nav.language", { defaultValue: "Language" })}
      </label>

      <select
        id="language-select"
        className="language-switcher__select"
        value={currentLanguage.split("-")[0]}
        onChange={handleLanguageChange}
        aria-label={t("nav.language", { defaultValue: "Language" })}
      >
        <option value="en">EN</option>
        <option value="es">ES</option>
        <option value="fr">FR</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
