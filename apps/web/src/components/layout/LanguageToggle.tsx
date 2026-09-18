import { useTranslation } from "react-i18next";

import { changeAppLocale } from "@/lib/i18n/config";
import type { AppLocale } from "@/lib/i18n/locale";

export default function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const currentLocale = (i18n.language === "pt" ? "pt" : "en") as AppLocale;
  const nextLocale: AppLocale = currentLocale === "pt" ? "en" : "pt";

  return (
    <button
      type="button"
      onClick={() => changeAppLocale(nextLocale)}
      className="ds-focus rounded-panel border border-border/30 bg-surface-muted/40 px-3 py-2 text-small font-medium text-foreground-muted transition-colors duration-fast ease-out hover:border-accent/40 hover:text-accent"
      aria-label={
        nextLocale === "pt" ? t("language.switchToPt") : t("language.switchToEn")
      }
    >
      {currentLocale === "pt" ? t("language.en") : t("language.pt")}
    </button>
  );
}
