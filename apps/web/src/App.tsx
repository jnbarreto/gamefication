import { useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth/AuthProvider";
import AchievementsPage from "@/pages/AchievementsPage";
import DashboardPage from "@/pages/DashboardPage";
import HistoryPage from "@/pages/HistoryPage";
import LoginPage from "@/pages/LoginPage";
import QuestBoardPage from "@/pages/QuestBoardPage";
import QuestsPage from "@/pages/QuestsPage";
import SkillsPage from "@/pages/SkillsPage";
import UsersPage from "@/pages/UsersPage";

type PageId =
  | "dashboard"
  | "quests"
  | "questBoard"
  | "skills"
  | "history"
  | "achievements"
  | "users";

function renderPage(page: PageId) {
  switch (page) {
    case "quests":
      return <QuestsPage />;
    case "questBoard":
      return <QuestBoardPage />;
    case "skills":
      return <SkillsPage />;
    case "history":
      return <HistoryPage />;
    case "achievements":
      return <AchievementsPage />;
    case "users":
      return <UsersPage />;
    default:
      return <DashboardPage />;
  }
}

const NAVIGABLE_PAGES: PageId[] = [
  "dashboard",
  "quests",
  "questBoard",
  "skills",
  "history",
  "achievements",
  "users",
];

function isPageId(value: string): value is PageId {
  return NAVIGABLE_PAGES.includes(value as PageId);
}

export default function App() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [page, setPage] = useState<PageId>("dashboard");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base text-foreground-muted">
        …
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const visibleNavPages = NAVIGABLE_PAGES.filter(
    (navPage) => navPage !== "users" || user?.role === "ADMIN",
  );

  return (
    <AppLayout
      activeNav={page}
      navItems={visibleNavPages}
      onNavSelect={(id) => {
        if (isPageId(id)) {
          setPage(id);
        }
      }}
    >
      {renderPage(page)}
    </AppLayout>
  );
}
