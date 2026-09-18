import { useTranslation } from "react-i18next";

import { toIntlLocale, type AppLocale } from "./locale";

export function useAppLocale() {
  const { i18n } = useTranslation();
  const locale = (i18n.language === "pt" ? "pt" : "en") as AppLocale;
  const intlLocale = toIntlLocale(locale);

  return {
    locale,
    intlLocale,
    formatDateTime: (value: string) => new Date(value).toLocaleString(intlLocale),
    formatDate: (value: string | null) => {
      if (!value) {
        return null;
      }

      return new Date(value).toLocaleDateString(intlLocale);
    },
    formatTime: (value: string) =>
      new Date(value).toLocaleTimeString(intlLocale, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    formatDayHeading: (value: string) =>
      new Date(value).toLocaleDateString(intlLocale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
  };
}
