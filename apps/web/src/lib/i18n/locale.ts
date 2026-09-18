export type AppLocale = "en" | "pt";

export const LOCALE_STORAGE_KEY = "gamefication:locale";

export function getStoredLocale(): AppLocale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);

  if (stored === "en" || stored === "pt") {
    return stored;
  }

  return navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
}

export function persistLocale(locale: AppLocale): void {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.documentElement.lang = locale;
}

export function toIntlLocale(locale: AppLocale): string {
  return locale === "pt" ? "pt-BR" : "en-US";
}
