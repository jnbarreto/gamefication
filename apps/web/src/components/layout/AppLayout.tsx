import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import LanguageToggle from "./LanguageToggle";
import ProjectLogo from "./ProjectLogo";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import { NAV_ITEMS } from "./navItems";

type AppLayoutProps = {
  children: ReactNode;
  activeNav?: string;
  navItems?: string[];
  onNavSelect?: (id: string) => void;
};

const NAVIGABLE_PAGES = new Set([
  "dashboard",
  "quests",
  "questBoard",
  "skills",
  "history",
  "achievements",
  "users",
]);

export default function AppLayout({
  children,
  activeNav = "dashboard",
  navItems,
  onNavSelect,
}: AppLayoutProps) {
  const { t } = useTranslation();
  const visibleNavItems = NAV_ITEMS.filter((item) =>
    (navItems ?? NAV_ITEMS.map((entry) => entry.id)).includes(item.id),
  );

  return (
    <div className="min-h-screen bg-base text-foreground">
      <header className="ds-app-header">
        <div className="ds-app-header__inner">
          <div className="ds-app-header__brand">
            <ProjectLogo />
          </div>

          <nav className="ds-app-header__nav" aria-label={t("nav.main")}>
            <ul className="ds-app-header__nav-list">
              {visibleNavItems.map((item) => {
                const isActive = item.id === activeNav;
                const isNavigable = onNavSelect && NAVIGABLE_PAGES.has(item.id);
                const label = t(`nav.${item.id}`);
                const className = isActive
                  ? "ds-app-nav-link ds-app-nav-link--active"
                  : "ds-app-nav-link";

                return (
                  <li key={item.id}>
                    {isNavigable ? (
                      <button
                        type="button"
                        className={className}
                        onClick={() => onNavSelect(item.id)}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {label}
                      </button>
                    ) : (
                      <span className={className}>{label}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ds-app-header__actions">
            <LanguageToggle />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="ds-app-main">{children}</main>
    </div>
  );
}

