import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import QuestBoardAddPanel from "@/components/quests/QuestBoardAddPanel";
import QuestCardsView from "@/components/quests/QuestCardsView";
import QuestKanbanView from "@/components/quests/QuestKanbanView";
import QuestRoadmapView from "@/components/quests/QuestRoadmapView";
import { ApiError } from "@/lib/api/client";
import {
  cancelQuest,
  completeQuest,
  fetchQuests,
  reopenQuest,
  startQuest,
  updateQuest,
  updateQuestMission,
  type UpdateQuestRequest,
} from "@/lib/api/quests";
import { fetchSkillTree } from "@/lib/api/skills";
import type { QuestResponse, SkillCategoryResponse } from "@/lib/api/types";
import { useConfirm } from "@/lib/confirm/ConfirmDialogProvider";
import { useQuestBoardSelection } from "@/lib/quests/questBoardSelection";

type BoardView = "kanban" | "roadmap" | "cards";

function buildSkillOptions(categories: SkillCategoryResponse[]) {
  return categories.flatMap((category) =>
    category.skills.map((skill) => ({
      id: skill.id,
      label: `${category.name} · ${skill.name}`,
    })),
  );
}

export default function QuestBoardPage() {
  const { t } = useTranslation();
  const { confirm } = useConfirm();
  const [quests, setQuests] = useState<QuestResponse[]>([]);
  const [skillOptions, setSkillOptions] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [view, setView] = useState<BoardView>("kanban");
  const [showCancelled, setShowCancelled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionQuestId, setActionQuestId] = useState<string | null>(null);
  const [savingQuestId, setSavingQuestId] = useState<string | null>(null);
  const [togglingMissionId, setTogglingMissionId] = useState<string | null>(null);
  const [showEvidenceForId, setShowEvidenceForId] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const { selectedIdSet, addQuest, removeQuest, pruneMissing } = useQuestBoardSelection();

  const loadQuests = useCallback(async () => {
    const result = await fetchQuests({ period: "last30days" });
    setQuests(result.quests);
    pruneMissing(new Set(result.quests.map((quest) => quest.id)));
  }, [pruneMissing]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [questsResult, skillsResult] = await Promise.all([
          fetchQuests({ period: "last30days" }),
          fetchSkillTree(),
        ]);

        if (cancelled) {
          return;
        }

        setQuests(questsResult.quests);
        setSkillOptions(buildSkillOptions(skillsResult.categories));
        pruneMissing(new Set(questsResult.quests.map((quest) => quest.id)));
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        if (err instanceof ApiError) {
          setError(err.message);
          return;
        }

        setError(err instanceof Error ? err.message : t("common.unknownError"));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [pruneMissing, t]);

  const boardQuests = useMemo(
    () => quests.filter((quest) => selectedIdSet.has(quest.id)),
    [quests, selectedIdSet],
  );

  async function handleStart(questId: string) {
    setActionError(null);
    setActionQuestId(questId);

    try {
      await startQuest(questId);
      await loadQuests();
    } catch (err: unknown) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("errors.startQuest"),
      );
    } finally {
      setActionQuestId(null);
    }
  }

  async function handleComplete(questId: string) {
    setActionError(null);
    setActionQuestId(questId);

    try {
      await completeQuest(
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
      await loadQuests();
    } catch (err: unknown) {
      setActionError(
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

  async function handleCancel(questId: string) {
    const confirmed = await confirm({
      title: t("quests.cancel"),
      message: t("quests.cancelConfirm"),
      confirmLabel: t("common.continue"),
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    setActionError(null);
    setActionQuestId(questId);

    try {
      await cancelQuest(questId);
      await loadQuests();
    } catch (err: unknown) {
      setActionError(
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

  async function handleSave(questId: string, input: UpdateQuestRequest) {
    setActionError(null);
    setSavingQuestId(questId);

    try {
      await updateQuest(questId, input);
      await loadQuests();
    } catch (err: unknown) {
      setActionError(
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

  async function handleReopen(questId: string) {
    setActionError(null);
    setActionQuestId(questId);

    try {
      await reopenQuest(questId);
      await loadQuests();
    } catch (err: unknown) {
      setActionError(
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
    setActionError(null);
    setTogglingMissionId(missionId);

    try {
      await updateQuestMission(questId, missionId, completed);
      await loadQuests();
    } catch (err: unknown) {
      setActionError(
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

  const sharedViewProps = {
    quests: boardQuests,
    actionQuestId,
    togglingMissionId,
    showEvidenceForId,
    evidenceUrl,
    skillOptions,
    onEvidenceUrlChange: setEvidenceUrl,
    onStart: handleStart,
    onComplete: handleComplete,
    onCancel: handleCancel,
    onReopen: handleReopen,
    onSave: handleSave,
    savingQuestId,
    onToggleMission: handleToggleMission,
    onToggleEvidence: handleToggleEvidence,
    onRemoveFromBoard: removeQuest,
  };

  if (error) {
    return (
      <div className="ds-error">
        {t("errors.loadQuests", { message: error })} {t("common.runDevApi")}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-semibold">{t("questBoard.title")}</h2>
        <p className="mt-2 text-foreground-muted">{t("questBoard.subtitle")}</p>
      </div>

      {actionError && <div className="ds-error">{actionError}</div>}

      <section className="ds-quest-board">
        <div className="ds-quest-board__toolbar">
          <div
            className="ds-quest-board__view-switch"
            role="tablist"
            aria-label={t("questBoard.title")}
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "kanban"}
              className={`ds-quest-board__view-btn ds-focus ${view === "kanban" ? "ds-quest-board__view-btn--active" : ""}`}
              onClick={() => setView("kanban")}
            >
              {t("questBoard.viewKanban")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "roadmap"}
              className={`ds-quest-board__view-btn ds-focus ${view === "roadmap" ? "ds-quest-board__view-btn--active" : ""}`}
              onClick={() => setView("roadmap")}
            >
              {t("questBoard.viewRoadmap")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "cards"}
              className={`ds-quest-board__view-btn ds-focus ${view === "cards" ? "ds-quest-board__view-btn--active" : ""}`}
              onClick={() => setView("cards")}
            >
              {t("questBoard.viewCards")}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {view === "kanban" && (
              <label className="ds-quest-board__filter">
                <input
                  type="checkbox"
                  checked={showCancelled}
                  onChange={(event) => setShowCancelled(event.target.checked)}
                />
                <span>{t("questBoard.showCancelled")}</span>
              </label>
            )}

            <QuestBoardAddPanel
              quests={quests}
              selectedIdSet={selectedIdSet}
              skillOptions={skillOptions}
              onAddQuest={addQuest}
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-foreground-muted">{t("quests.loading")}</p>
        ) : selectedIdSet.size === 0 ? (
          <div className="ds-quest-board-empty">
            <p>{t("questBoard.noSelection")}</p>
            <QuestBoardAddPanel
              quests={quests}
              selectedIdSet={selectedIdSet}
              skillOptions={skillOptions}
              onAddQuest={addQuest}
            />
          </div>
        ) : view === "kanban" ? (
          <QuestKanbanView {...sharedViewProps} showCancelled={showCancelled} />
        ) : view === "roadmap" ? (
          <QuestRoadmapView quests={boardQuests} />
        ) : (
          <QuestCardsView {...sharedViewProps} />
        )}
      </section>
    </div>
  );
}
