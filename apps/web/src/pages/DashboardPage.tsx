import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  DashboardContent,
  DashboardSkeleton,
} from "@/components/dashboard/DashboardSections";
import { ApiError } from "@/lib/api/client";
import { fetchDashboard } from "@/lib/api/dashboard";
import {
  cancelQuest,
  completeQuest,
  fetchActiveQuests,
  reopenQuest,
  startQuest,
  updateQuest,
  updateQuestMission,
  type UpdateQuestRequest,
} from "@/lib/api/quests";
import { fetchSkillTree } from "@/lib/api/skills";
import type { DashboardResponse, QuestResponse, SkillCategoryResponse } from "@/lib/api/types";
import { useConfirm } from "@/lib/confirm/ConfirmDialogProvider";

function buildSkillOptions(categories: SkillCategoryResponse[]) {
  return categories.flatMap((category) =>
    category.skills.map((skill) => ({
      id: skill.id,
      label: `${category.name} · ${skill.name}`,
    })),
  );
}

function mergeQuestUpdate(quests: QuestResponse[], updated: QuestResponse): QuestResponse[] {
  const index = quests.findIndex((quest) => quest.id === updated.id);

  if (index === -1) {
    if (updated.status === "TODO" || updated.status === "IN_PROGRESS") {
      return [updated, ...quests];
    }

    return quests;
  }

  if (updated.status !== "TODO" && updated.status !== "IN_PROGRESS") {
    return quests.filter((quest) => quest.id !== updated.id);
  }

  return quests.map((quest) => (quest.id === updated.id ? updated : quest));
}

function mergeMissionUpdate(
  quests: QuestResponse[],
  questId: string,
  mission: QuestResponse["missions"][number],
): QuestResponse[] {
  return quests.map((quest) => {
    if (quest.id !== questId) {
      return quest;
    }

    return {
      ...quest,
      missions: quest.missions.map((item) => (item.id === mission.id ? mission : item)),
    };
  });
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { confirm } = useConfirm();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [activeQuests, setActiveQuests] = useState<QuestResponse[]>([]);
  const [skillOptions, setSkillOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [questActionError, setQuestActionError] = useState<string | null>(null);
  const [startingQuestId, setStartingQuestId] = useState<string | null>(null);
  const [actionQuestId, setActionQuestId] = useState<string | null>(null);
  const [savingQuestId, setSavingQuestId] = useState<string | null>(null);
  const [togglingMissionId, setTogglingMissionId] = useState<string | null>(null);
  const [showEvidenceForId, setShowEvidenceForId] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const loadDashboard = useCallback(async () => {
    const [dashboardResult, activeQuestsResult, skillTreeResult] = await Promise.all([
      fetchDashboard(),
      fetchActiveQuests(),
      fetchSkillTree(),
    ]);

    setDashboard(dashboardResult);
    setActiveQuests(activeQuestsResult);
    setSkillOptions(buildSkillOptions(skillTreeResult.categories));
  }, []);

  useEffect(() => {
    loadDashboard().catch((err: unknown) => {
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }

      setError(err instanceof Error ? err.message : t("common.unknownError"));
    });
  }, [loadDashboard, t]);

  async function handleStartQuest(questId: string) {
    setQuestActionError(null);
    setStartingQuestId(questId);

    try {
      const result = await startQuest(questId);
      setDashboard((current) =>
        current
          ? {
              ...current,
              todayQuests: mergeQuestUpdate(current.todayQuests, result.quest),
            }
          : current,
      );
      setActiveQuests((current) => mergeQuestUpdate(current, result.quest));
    } catch (err: unknown) {
      setQuestActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("errors.startQuest"),
      );
    } finally {
      setStartingQuestId(null);
    }
  }

  async function handleCompleteQuest(questId: string) {
    setQuestActionError(null);
    setActionQuestId(questId);

    try {
      const result = await completeQuest(
        questId,
        evidenceUrl.trim()
          ? {
              type: "URL",
              value: evidenceUrl.trim(),
            }
          : undefined,
      );
      setShowEvidenceForId(null);
      setEvidenceUrl("");
      setDashboard((current) => {
        if (!current) return current;

        const newHeatmap = current.streak.activityHeatmap
          ? {
              ...current.streak.activityHeatmap,
              cells: current.streak.activityHeatmap.cells.map((cell) => {
                if (cell.day === result.streak.lastActivityDay) {
                  return {
                    ...cell,
                    xp: cell.xp + result.quest.baseXp,
                    level: Math.max(cell.level, 4) as 0 | 1 | 2 | 3 | 4,
                  };
                }
                return cell;
              }),
            }
          : undefined;

        return {
          ...current,
          todayQuests: mergeQuestUpdate(current.todayQuests, result.quest),
          character: result.character,
          streak: {
            ...result.streak,
            activityHeatmap: newHeatmap,
          },
          recentTransactions: [
            ...result.xpTransactions,
            ...current.recentTransactions,
          ].slice(0, 10),
        };
      });
      setActiveQuests((current) => mergeQuestUpdate(current, result.quest));
    } catch (err: unknown) {
      setQuestActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("errors.completeQuest"),
      );
    } finally {
      setActionQuestId(null);
    }
  }

  async function handleCancelQuest(questId: string) {
    const confirmed = await confirm({
      title: t("quests.cancel"),
      message: t("quests.cancelConfirm"),
      confirmLabel: t("common.continue"),
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    setQuestActionError(null);
    setActionQuestId(questId);

    try {
      const result = await cancelQuest(questId);
      setDashboard((current) =>
        current
          ? {
              ...current,
              todayQuests: mergeQuestUpdate(current.todayQuests, result.quest),
            }
          : current,
      );
      setActiveQuests((current) => mergeQuestUpdate(current, result.quest));
    } catch (err: unknown) {
      setQuestActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("errors.cancelQuest"),
      );
    } finally {
      setActionQuestId(null);
    }
  }

  async function handleSaveQuest(questId: string, input: UpdateQuestRequest) {
    setQuestActionError(null);
    setSavingQuestId(questId);

    try {
      const result = await updateQuest(questId, input);
      setDashboard((current) =>
        current
          ? {
              ...current,
              todayQuests: mergeQuestUpdate(current.todayQuests, result.quest),
            }
          : current,
      );
      setActiveQuests((current) => mergeQuestUpdate(current, result.quest));
    } catch (err: unknown) {
      setQuestActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("errors.updateQuest"),
      );
    } finally {
      setSavingQuestId(null);
    }
  }

  async function handleReopenQuest(questId: string) {
    setQuestActionError(null);
    setActionQuestId(questId);

    try {
      const result = await reopenQuest(questId);
      setDashboard((current) =>
        current
          ? {
              ...current,
              todayQuests: mergeQuestUpdate(current.todayQuests, result.quest),
            }
          : current,
      );
      setActiveQuests((current) => mergeQuestUpdate(current, result.quest));
    } catch (err: unknown) {
      setQuestActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("errors.reopenQuest"),
      );
    } finally {
      setActionQuestId(null);
    }
  }

  async function handleToggleMission(
    questId: string,
    missionId: string,
    completed: boolean,
  ) {
    setQuestActionError(null);
    setTogglingMissionId(missionId);

    try {
      const result = await updateQuestMission(questId, missionId, completed);
      setDashboard((current) =>
        current
          ? {
              ...current,
              todayQuests: mergeMissionUpdate(current.todayQuests, questId, result.mission),
            }
          : current,
      );
      setActiveQuests((current) => mergeMissionUpdate(current, questId, result.mission));
    } catch (err: unknown) {
      setQuestActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("errors.updateMission"),
      );
    } finally {
      setTogglingMissionId(null);
    }
  }

  function handleToggleEvidence(questId: string | null) {
    setShowEvidenceForId(questId);

    if (!questId) {
      setEvidenceUrl("");
    }
  }

  if (error) {
    return (
      <div className="ds-error">
        {t("errors.loadDashboard", { message: error })} {t("common.runDevApi")}
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div aria-busy="true" aria-live="polite">
        <p className="mb-6 text-small text-foreground-muted">
          {t("dashboard.loading")}
        </p>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <DashboardContent
      dashboard={dashboard}
      activeQuests={activeQuests}
      onStartQuest={handleStartQuest}
      onCompleteQuest={handleCompleteQuest}
      onCancelQuest={handleCancelQuest}
      onReopenQuest={handleReopenQuest}
      onSaveQuest={handleSaveQuest}
      savingQuestId={savingQuestId}
      onToggleMission={handleToggleMission}
      startingQuestId={startingQuestId}
      actionQuestId={actionQuestId}
      togglingMissionId={togglingMissionId}
      showEvidenceForId={showEvidenceForId}
      evidenceUrl={evidenceUrl}
      skillOptions={skillOptions}
      onToggleEvidence={handleToggleEvidence}
      onEvidenceUrlChange={setEvidenceUrl}
      questActionError={questActionError}
    />
  );
}
