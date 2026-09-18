import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { getStoredLocale, persistLocale } from "./locale";
import en from "./locales/en";
import pt from "./locales/pt";

const initialLocale = getStoredLocale();
document.documentElement.lang = initialLocale;

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
  },
  lng: initialLocale,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export function changeAppLocale(locale: "en" | "pt"): void {
  persistLocale(locale);
  void i18n.changeLanguage(locale);
}

export default i18n;
