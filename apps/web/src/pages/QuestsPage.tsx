import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import QuestDetailModal from "@/components/quests/QuestDetailModal";
import { ApiError } from "@/lib/api/client";
import {
  cancelQuest,
  completeQuest,
  createQuest,
  fetchQuests,
  reopenQuest,
  startQuest,
  updateQuest,
  updateQuestMission,
  type UpdateQuestRequest,
} from "@/lib/api/quests";
import { fetchSkillTree } from "@/lib/api/skills";
import type { QuestResponse } from "@/lib/api/types";
import { useConfirm } from "@/lib/confirm/ConfirmDialogProvider";
import { canEditQuest } from "@/lib/quests/questEditForm";
import { allQuestMissionsCompleted } from "@/lib/quests/questMissionProgress";
import {
  questReopenPillButtonClass,
  questStatusPillClass,
} from "@/lib/quests/questStatusPill";
import {
  QUEST_DIFFICULTIES,
  QUEST_STATUSES,
  QUEST_TYPES,
  XP_BY_DIFFICULTY,
} from "@/lib/constants/quest";
import { useAppLocale } from "@/lib/i18n/useAppLocale";
import QuestMissionFields from "@/components/quests/QuestMissionFields";
import type { QuestMissionDraft } from "@/lib/quests/questEditForm";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-surface-muted bg-surface-muted/40 p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type StatusFilter = (typeof QUEST_STATUSES)[number] | "ALL";

export default function QuestsPage() {
  const { t } = useTranslation();
  const { confirm } = useConfirm();
  const { formatDateTime } = useAppLocale();
  const [quests, setQuests] = useState<QuestResponse[]>([]);
  const [skillOptions, setSkillOptions] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [detailQuestId, setDetailQuestId] = useState<string | null>(null);
  const [detailEditMode, setDetailEditMode] = useState(false);
  const [savingQuestId, setSavingQuestId] = useState<string | null>(null);
  const [togglingMissionId, setTogglingMissionId] = useState<string | null>(null);
  const [showEvidenceForId, setShowEvidenceForId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<(typeof QUEST_TYPES)[number]>("WORK");
  const [difficulty, setDifficulty] =
    useState<(typeof QUEST_DIFFICULTIES)[number]>("MEDIUM");
  const [skillId, setSkillId] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [missionDrafts, setMissionDrafts] = useState<QuestMissionDraft[]>([{ title: "" }]);

  const loadQuests = useCallback(async () => {
    const params =
      statusFilter === "ALL"
        ? { period: "last30days" as const }
        : { period: "last30days" as const, status: statusFilter };

    const result = await fetchQuests(params);
    setQuests(result.quests);
  }, [statusFilter]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [questsResult, skillsResult] = await Promise.all([
          fetchQuests(
            statusFilter === "ALL"
              ? { period: "last30days" }
              : { period: "last30days", status: statusFilter },
          ),
          fetchSkillTree(),
        ]);

        if (cancelled) {
          return;
        }

        const options = skillsResult.categories.flatMap((category) =>
          category.skills.map((skill) => ({
            id: skill.id,
            label: `${category.name} · ${skill.name}`,
          })),
        );

        setQuests(questsResult.quests);
        setSkillOptions(options);

        if (options.length > 0) {
          setSkillId((current) => current || options[0]!.id);
        }
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
  }, [statusFilter, t]);

  const xpForForm = useMemo(() => XP_BY_DIFFICULTY[difficulty], [difficulty]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setActionError(null);
    setWarnings([]);

    try {
      const missions = missionDrafts.map((item) => item.title.trim()).filter(Boolean);
      const result = await createQuest({
        title: title.trim(),
        type,
        difficulty,
        skillAllocations: [{ skillId, xp: xpForForm }],
        ...(missions.length > 0 ? { missions } : {}),
      });

      setWarnings(result.warnings);
      setTitle("");
      setMissionDrafts([{ title: "" }]);
      await loadQuests();
    } catch (err: unknown) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("errors.createQuest"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStart(questId: string) {
    setActionError(null);

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
    }
  }

  async function handleComplete(questId: string) {
    setActionError(null);

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
      setActiveQuestId(null);
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
    }
  }

  async function handleReopen(questId: string) {
    setActionError(null);

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
    }
  }

  async function handleSaveQuest(questId: string, input: UpdateQuestRequest) {
    setActionError(null);
    setSavingQuestId(questId);

    try {
      await updateQuest(questId, input);
      await loadQuests();
      setDetailEditMode(false);
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

  const detailQuest = quests.find((quest) => quest.id === detailQuestId) ?? null;

  if (error) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 p-6 text-sm text-danger">
        {t("errors.loadQuests", { message: error })} {t("common.runDevApi")}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-semibold">{t("quests.title")}</h2>
        <p className="mt-2 text-foreground-muted">{t("quests.subtitle")}</p>
      </div>

      {actionError && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {actionError}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      )}

      <Panel title={t("quests.createQuest")}>
        <form className="grid gap-4" onSubmit={handleCreate}>
          <label className="grid gap-2 text-sm">
            <span className="text-foreground-muted">{t("quests.titleLabel")}</span>
            <input
              className="rounded-lg border border-surface-muted bg-surface px-3 py-2"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm">
              <span className="text-foreground-muted">{t("quests.type")}</span>
              <select
                className="rounded-lg border border-surface-muted bg-surface px-3 py-2"
                value={type}
                onChange={(event) =>
                  setType(event.target.value as (typeof QUEST_TYPES)[number])
                }
              >
                {QUEST_TYPES.map((questType) => (
                  <option key={questType} value={questType}>
                    {questType}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-foreground-muted">{t("quests.difficulty")}</span>
              <select
                className="rounded-lg border border-surface-muted bg-surface px-3 py-2"
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(
                    event.target.value as (typeof QUEST_DIFFICULTIES)[number],
                  )
                }
              >
                {QUEST_DIFFICULTIES.map((questDifficulty) => (
                  <option key={questDifficulty} value={questDifficulty}>
                    {questDifficulty} ({XP_BY_DIFFICULTY[questDifficulty]}{" "}
                    {t("common.xp")})
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-foreground-muted">{t("quests.skill")}</span>
              <select
                className="rounded-lg border border-surface-muted bg-surface px-3 py-2"
                value={skillId}
                onChange={(event) => setSkillId(event.target.value)}
                required
                disabled={skillOptions.length === 0}
              >
                {skillOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-2">
            <QuestMissionFields
              missions={missionDrafts}
              disabled={submitting}
              onChange={setMissionDrafts}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !title.trim() || !skillId}
            className="ds-btn-primary inline-flex w-fit px-4 disabled:opacity-50"
          >
            {submitting ? t("common.creating") : t("quests.createQuestButton")}
          </button>
        </form>
      </Panel>

      <Panel title={t("quests.questList")}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-foreground-muted">{t("common.status")}</span>
            <select
              className="rounded-lg border border-surface-muted bg-surface px-3 py-2"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="ALL">{t("quests.allLast30Days")}</option>
              {QUEST_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`enums.questStatus.${status}`, { defaultValue: status })}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="text-sm text-foreground-muted">{t("quests.loading")}</p>
        ) : quests.length === 0 ? (
          <p className="text-sm text-foreground-muted">{t("quests.noQuests")}</p>
        ) : (
          <ul className="grid gap-4">
            {quests.map((quest) => (
              <li
                key={quest.id}
                className="rounded-lg border border-surface-muted bg-surface/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <button
                      type="button"
                      className="font-semibold text-left hover:text-accent"
                      onClick={() => {
                        setDetailEditMode(false);
                        setDetailQuestId(quest.id);
                      }}
                    >
                      {quest.title}
                    </button>
                    <p className="mt-1 text-sm text-foreground-muted">
                      {quest.type} · {quest.difficulty} · {quest.baseXp}{" "}
                      {t("common.xp")}
                    </p>
                    <p className="mt-1 text-xs text-foreground-muted">
                      {t("common.created")} {formatDateTime(quest.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className={questStatusPillClass(quest.status)}>
                      {t(`enums.questStatus.${quest.status}`, {
                        defaultValue: quest.status,
                      })}
                    </span>

                    {(quest.status === "CANCELLED" || quest.status === "COMPLETED") && (
                      <button
                        type="button"
                        onClick={() => handleReopen(quest.id)}
                        className={questReopenPillButtonClass}
                      >
                        {t("quests.reopen", { defaultValue: "Reopen" })}
                      </button>
                    )}
                  </div>
                </div>

                {quest.missions.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-surface-muted pt-3">
                    {quest.missions.map((mission) => (
                      <li key={mission.id}>
                        <label className="flex items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={mission.isCompleted}
                            disabled={quest.status !== "IN_PROGRESS"}
                            onChange={(event) =>
                              handleToggleMission(quest.id, mission.id, event.target.checked)
                            }
                          />
                          <span className={mission.isCompleted ? "line-through opacity-70" : ""}>
                            {mission.title}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}

                {(quest.status === "TODO" || quest.status === "IN_PROGRESS") && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {canEditQuest(quest) && (
                    <button
                      type="button"
                      onClick={() => {
                        setDetailEditMode(true);
                        setDetailQuestId(quest.id);
                      }}
                      className="rounded-lg px-3 py-2 text-sm text-foreground-muted hover:text-foreground"
                    >
                      {t("quests.edit")}
                    </button>
                  )}

                  {quest.status === "TODO" && (
                    <button
                      type="button"
                      onClick={() => handleStart(quest.id)}
                      className="ds-btn-primary"
                    >
                      {t("quests.start")}
                    </button>
                  )}

                  {quest.status === "IN_PROGRESS" && (
                    <>
                      <button
                        type="button"
                        disabled={!allQuestMissionsCompleted(quest)}
                        onClick={() => {
                          setActiveQuestId((current) =>
                            current === quest.id ? null : quest.id,
                          );
                          setEvidenceUrl("");
                        }}
                        className="ds-btn-success disabled:opacity-50"
                      >
                        {t("quests.complete")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancel(quest.id)}
                        className="rounded-lg px-3 py-2 text-sm text-foreground-muted hover:text-foreground"
                      >
                        {t("quests.cancel")}
                      </button>
                    </>
                  )}
                </div>
                )}

                {activeQuestId === quest.id && quest.status === "IN_PROGRESS" && (
                  <div className="mt-4 grid gap-3 border-t border-surface-muted pt-4">
                    <label className="grid gap-2 text-sm">
                      <span className="text-foreground-muted">
                        {t("common.evidenceUrlOptional")}
                      </span>
                      <input
                        className="rounded-lg border border-surface-muted bg-surface px-3 py-2"
                        value={evidenceUrl}
                        onChange={(event) => setEvidenceUrl(event.target.value)}
                        placeholder={t("common.evidencePlaceholder")}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleComplete(quest.id)}
                      className="ds-btn-success inline-flex w-fit"
                    >
                      {t("common.confirmComplete")}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <QuestDetailModal
        quest={detailQuest}
        open={detailQuest !== null}
        initialEditMode={detailEditMode}
        actionQuestId={null}
        savingQuestId={savingQuestId}
        togglingMissionId={togglingMissionId}
        showEvidenceForId={showEvidenceForId}
        evidenceUrl={evidenceUrl}
        skillOptions={skillOptions}
        onClose={() => {
          setDetailQuestId(null);
          setDetailEditMode(false);
          setShowEvidenceForId(null);
        }}
        onEvidenceUrlChange={setEvidenceUrl}
        onStart={handleStart}
        onComplete={handleComplete}
        onCancel={handleCancel}
        onReopen={handleReopen}
        onSave={handleSaveQuest}
        onToggleMission={handleToggleMission}
        onToggleEvidence={setShowEvidenceForId}
      />
    </div>
  );
}
