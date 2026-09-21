import { useTranslation } from "react-i18next";

import CharacterPortraitSlot from "@/components/character/CharacterPortraitSlot";
import StreakHeatmap from "@/components/dashboard/StreakHeatmap";
import {
  Badge,
  LinearProgressBar,
  Panel,
  StatBlock,
} from "@/components/design";
import { progressToNextMasteryLevel } from "@/lib/constants/mastery";
import QuestCardsView from "@/components/quests/QuestCardsView";
import { sortQuestsByDashboardPriority } from "@/lib/quests/sortQuestsByDashboardPriority";
import type { UpdateQuestRequest } from "@/lib/api/quests";
import type {
  CharacterResponse,
  DashboardResponse,
  QuestResponse,
  StreakResponse,
} from "@/lib/api/types";
import { useAppLocale } from "@/lib/i18n/useAppLocale";

type CharacterSheetHeroProps = {
  character: CharacterResponse;
  calendarDay: string;
};

function CharacterSheetHero({ character, calendarDay }: CharacterSheetHeroProps) {
  const { t } = useTranslation();
  const levelXpTotal = character.totalXp + character.xpToNextLevel;

  return (
    <section className="ds-character-sheet">
      <div className="ds-character-sheet__portrait">
        <CharacterPortraitSlot name={character.name} />
      </div>

      <div className="ds-character-sheet__body">
        <div className="ds-character-sheet__head">
          <div className="min-w-0">
            <p className="ds-character-sheet__day">{calendarDay}</p>
            <h1 className="ds-character-sheet__name">{character.name}</h1>
            <p className="ds-character-sheet__classline">
              {character.characterClass} · {character.specialization}
            </p>
            {character.currentRank && (
              <p className="ds-character-sheet__rank">{character.currentRank}</p>
            )}
          </div>

          <dl className="ds-character-sheet__stats">
            <StatBlock
              label={t("dashboard.level")}
              value={`Lv ${character.level}`}
              tone="xp"
            />
            <StatBlock
              label={t("dashboard.totalXp")}
              value={character.totalXp}
              tone="accent"
            />
            <StatBlock
              label={t("dashboard.toNextLevel")}
              value={character.xpToNextLevel}
              tone="default"
            />
          </dl>
        </div>

        <LinearProgressBar
          value={character.progressToNextLevel}
          label={`${t("common.xp")} ${character.totalXp} / ${levelXpTotal}`}
          hint={t("dashboard.progressToNextLevel", {
            level: character.level + 1,
          })}
        />
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="ds-empty">{message}</p>;
}

type StreakSidebarProps = {
  streak: StreakResponse;
};

function StreakSidebar({ streak }: StreakSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="ds-streak-sidebar">
      <h2 className="ds-streak-sidebar__title">{t("dashboard.streak")}</h2>

      <div className="ds-streak-sidebar__stats">
        <div className="ds-streak-sidebar__stat">
          <p className="ds-streak-sidebar__stat-label">{t("dashboard.current")}</p>
          <p className="ds-streak-sidebar__stat-value">
            {t("dashboard.streakCount", { count: streak.currentCount })}
          </p>
        </div>
        <div className="ds-streak-sidebar__stat">
          <p className="ds-streak-sidebar__stat-label">{t("dashboard.best")}</p>
          <p className="ds-streak-sidebar__stat-value">
            {t("dashboard.streakCount", { count: streak.bestCount })}
          </p>
        </div>
      </div>

      {streak.activityHeatmap && (
        <StreakHeatmap
          heatmap={streak.activityHeatmap}
          activeDay={streak.lastActivityDay}
        />
      )}
    </aside>
  );
}

type QuestActionHandlers = {
  onStartQuest: (questId: string) => Promise<void>;
  onCompleteQuest: (questId: string) => Promise<void>;
  onCancelQuest: (questId: string) => Promise<void>;
  onReopenQuest: (questId: string) => Promise<void>;
  onSaveQuest: (questId: string, input: UpdateQuestRequest) => Promise<void>;
  savingQuestId: string | null;
  onToggleMission: (
    questId: string,
    missionId: string,
    completed: boolean,
  ) => Promise<void>;
  startingQuestId: string | null;
  actionQuestId: string | null;
  togglingMissionId: string | null;
  actionError: string | null;
};

type QuestCardHandlers = QuestActionHandlers & {
  onToggleEvidence: (questId: string | null) => void;
  onEvidenceUrlChange: (value: string) => void;
  showEvidenceForId: string | null;
  evidenceUrl: string;
  skillOptions?: Array<{ id: string; label: string }>;
};

type TodaysDailiesPanelProps = QuestCardHandlers & {
  quests: QuestResponse[];
};

const MAX_DASHBOARD_QUESTS = 5;

function TodaysDailiesPanel({
  quests,
  onStartQuest,
  onCompleteQuest,
  onCancelQuest,
  onReopenQuest,
  onSaveQuest,
  savingQuestId,
  onToggleMission,
  onToggleEvidence,
  onEvidenceUrlChange,
  startingQuestId,
  actionQuestId,
  togglingMissionId,
  showEvidenceForId,
  evidenceUrl,
  skillOptions,
  actionError,
}: TodaysDailiesPanelProps) {
  const { t } = useTranslation();
  const sortedQuests = sortQuestsByDashboardPriority(quests);
  const displayedQuests = sortedQuests.slice(0, MAX_DASHBOARD_QUESTS);

  return (
    <Panel title={t("dashboard.todaysDailies")}>
      {actionError && (
        <div className="mb-3 rounded-panel border border-danger/30 bg-danger/10 p-2 text-micro text-danger">
          {actionError}
        </div>
      )}

      {displayedQuests.length === 0 ? (
        <EmptyState message={t("dashboard.noDailies")} />
      ) : (
        <QuestCardsView
          quests={displayedQuests}
          actionQuestId={actionQuestId}
          startingQuestId={startingQuestId}
          togglingMissionId={togglingMissionId}
          showEvidenceForId={showEvidenceForId}
          evidenceUrl={evidenceUrl}
          skillOptions={skillOptions}
          onEvidenceUrlChange={onEvidenceUrlChange}
          onStart={onStartQuest}
          onComplete={onCompleteQuest}
          onCancel={onCancelQuest}
          onReopen={onReopenQuest}
          onSave={onSaveQuest}
          savingQuestId={savingQuestId}
          onToggleMission={onToggleMission}
          onToggleEvidence={onToggleEvidence}
        />
      )}
    </Panel>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="ds-dashboard-hero-row">
        <div className="ds-panel space-y-4">
          <div className="h-3 w-24 animate-pulse rounded-panel bg-surface-muted" />
          <div className="h-8 w-48 animate-pulse rounded-panel bg-surface-muted" />
          <div className="h-4 w-64 animate-pulse rounded-panel bg-surface-muted" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-panel bg-surface-muted"
              />
            ))}
          </div>
          <div className="h-2 animate-pulse rounded-panel bg-surface-muted" />
        </div>
        <div className="ds-streak-sidebar">
          <div className="h-4 w-20 animate-pulse rounded-panel bg-surface-muted" />
          <div className="h-4 w-full animate-pulse rounded-panel bg-surface-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded-panel bg-surface-muted" />
          <div className="mt-auto h-24 animate-pulse rounded-panel bg-surface-muted/60" />
        </div>
      </div>
      <div className="ds-panel h-48 animate-pulse bg-surface-muted/40" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ds-panel h-40 animate-pulse bg-surface-muted/40" />
        <div className="ds-panel h-40 animate-pulse bg-surface-muted/40" />
      </div>
      <div className="ds-panel h-32 animate-pulse bg-surface-muted/40" />
    </div>
  );
}

type DashboardContentProps = {
  dashboard: DashboardResponse;
  activeQuests: QuestResponse[];
  onStartQuest: (questId: string) => Promise<void>;
  onCompleteQuest: (questId: string) => Promise<void>;
  onCancelQuest: (questId: string) => Promise<void>;
  onReopenQuest: (questId: string) => Promise<void>;
  onSaveQuest: (questId: string, input: UpdateQuestRequest) => Promise<void>;
  savingQuestId: string | null;
  onToggleMission: (
    questId: string,
    missionId: string,
    completed: boolean,
  ) => Promise<void>;
  onToggleEvidence: (questId: string | null) => void;
  onEvidenceUrlChange: (value: string) => void;
  startingQuestId: string | null;
  actionQuestId: string | null;
  togglingMissionId: string | null;
  showEvidenceForId: string | null;
  evidenceUrl: string;
  skillOptions?: Array<{ id: string; label: string }>;
  questActionError: string | null;
};

function masteryTone(level: string): string {
  if (level === "TEACH") {
    return "text-mastery-high";
  }

  if (level === "SOLO") {
    return "text-accent";
  }

  return "text-foreground-muted";
}

function DashboardContent({
  dashboard,
  activeQuests,
  onStartQuest,
  onCompleteQuest,
  onCancelQuest,
  onReopenQuest,
  onSaveQuest,
  savingQuestId,
  onToggleMission,
  onToggleEvidence,
  onEvidenceUrlChange,
  startingQuestId,
  actionQuestId,
  togglingMissionId,
  showEvidenceForId,
  evidenceUrl,
  skillOptions,
  questActionError,
}: DashboardContentProps) {
  const { t } = useTranslation();
  const { formatDateTime } = useAppLocale();

  const {
    character,
    calendarDay,
    topSkills,
    recentTransactions,
    streak,
    staleSkills,
  } = dashboard;
  return (
    <div className="ds-dashboard-grid">
      <h2 className="sr-only">{t("dashboard.title")}</h2>

      <div className="ds-dashboard-hero-row">
        <CharacterSheetHero character={character} calendarDay={calendarDay} />
        <StreakSidebar streak={streak} />
      </div>

      <TodaysDailiesPanel
        quests={activeQuests}
        onStartQuest={onStartQuest}
        onCompleteQuest={onCompleteQuest}
        onCancelQuest={onCancelQuest}
        onReopenQuest={onReopenQuest}
        onSaveQuest={onSaveQuest}
        savingQuestId={savingQuestId}
        onToggleMission={onToggleMission}
        onToggleEvidence={onToggleEvidence}
        onEvidenceUrlChange={onEvidenceUrlChange}
        startingQuestId={startingQuestId}
        actionQuestId={actionQuestId}
        togglingMissionId={togglingMissionId}
        showEvidenceForId={showEvidenceForId}
        evidenceUrl={evidenceUrl}
        skillOptions={skillOptions}
        actionError={questActionError}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t("dashboard.topSkills")} className="ds-panel--compact">
          {topSkills.length === 0 ? (
            <EmptyState message={t("dashboard.noSkillProgress")} />
          ) : (
            <ul className="ds-skill-highlight-list">
              {topSkills.map((skill) => (
                <li key={skill.id} className="ds-skill-highlight">
                  <div className="ds-skill-highlight__head">
                    <p className="ds-skill-highlight__name">{skill.name}</p>
                    <p className="ds-skill-highlight__xp">
                      {skill.xp} {t("common.xp")}
                    </p>
                  </div>
                  <LinearProgressBar
                    value={progressToNextMasteryLevel(skill.xp, skill.masteryLevel)}
                    showPercent={false}
                  />
                  <p
                    className={`ds-skill-highlight__mastery ${masteryTone(skill.masteryLevel)}`}
                  >
                    {t(`enums.mastery.${skill.masteryLevel}`, {
                      defaultValue: skill.masteryLevel,
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t("dashboard.recentXp")} className="ds-panel--compact">
          {recentTransactions.length === 0 ? (
            <EmptyState message={t("dashboard.noTransactions")} />
          ) : (
            <div className="ds-scroll-area ds-scroll-area--tall">
              <ul className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <li key={transaction.id} className="ds-log-row ds-log-row--compact">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-small font-medium">
                          {transaction.description}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-micro text-foreground-muted">
                          {transaction.sourceType} ·{" "}
                          {formatDateTime(transaction.createdAt)}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-small font-semibold text-xp">
                        +{transaction.amount}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
      </div>

      <Panel title={t("dashboard.staleAlerts")} className="ds-panel--compact">
        {staleSkills.length === 0 ? (
          <EmptyState message={t("dashboard.allSkillsActive")} />
        ) : (
          <div className="ds-scroll-area ds-scroll-area--short">
            <ul className="space-y-2">
              {staleSkills.map((skill) => (
                <li
                  key={skill.id}
                  className="ds-log-row ds-log-row--compact flex items-center justify-between gap-2 border-warning/30 bg-warning/10"
                >
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-small font-medium">{skill.name}</p>
                      <Badge variant="warning">{t("skills.stale")}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-micro text-foreground-muted">
                      {skill.categoryName}
                    </p>
                  </div>
                  <p className="shrink-0 text-right font-mono text-micro text-warning">
                    {skill.lastXpAt
                      ? t("dashboard.lastXp", {
                          date: formatDateTime(skill.lastXpAt),
                        })
                      : t("dashboard.neverPracticed")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>
    </div>
  );
}

export { CharacterSheetHero, DashboardContent, DashboardSkeleton, EmptyState };
