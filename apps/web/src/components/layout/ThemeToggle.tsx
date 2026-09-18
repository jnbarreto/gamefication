import { useTranslation } from "react-i18next";

import { useTheme } from "@/lib/theme/useTheme";

import { RadianceIcon, VoidIcon } from "./ThemeIcons";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`ds-focus ds-theme-toggle rounded-panel border border-border/30 p-2 transition-colors duration-fast ease-out hover:border-accent ${
        isDark
          ? "text-xp/85 hover:text-xp"
          : "text-info/80 hover:text-info"
      }`}
      aria-label={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
      title={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
    >
      {isDark ? <RadianceIcon /> : <VoidIcon />}
    </button>
  );
}
