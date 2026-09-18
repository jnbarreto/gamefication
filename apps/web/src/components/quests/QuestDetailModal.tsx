import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/design";
import type { UpdateQuestRequest } from "@/lib/api/quests";
import type { QuestResponse } from "@/lib/api/types";
import {
  QUEST_DIFFICULTIES,
  QUEST_TYPES,
  XP_BY_DIFFICULTY,
} from "@/lib/constants/quest";
import {
  buildUpdateQuestMissions,
  canEditQuest,
  missionDraftsFromQuest,
  type QuestMissionDraft,
} from "@/lib/quests/questEditForm";
import {
  allQuestMissionsCompleted,
  completedMissionCount,
} from "@/lib/quests/questMissionProgress";
import {
  questReopenPillButtonClass,
  questStatusPillClass,
} from "@/lib/quests/questStatusPill";

import QuestMissionFields from "./QuestMissionFields";

import { LinkifiedText } from "../ui/LinkifiedText";

type QuestDetailModalProps = {
  quest: QuestResponse | null;
  open: boolean;
  initialEditMode?: boolean;
  actionQuestId: string | null;
  savingQuestId?: string | null;
  startingQuestId?: string | null;
  togglingMissionId: string | null;
  showEvidenceForId: string | null;
  evidenceUrl: string;
  skillOptions?: Array<{ id: string; label: string }>;
  onClose: () => void;
  onEvidenceUrlChange: (value: string) => void;
  onStart: (questId: string) => void;
  onComplete: (questId: string) => void;
  onCancel: (questId: string) => void;
  onReopen: (questId: string) => void;
  onSave: (questId: string, input: UpdateQuestRequest) => void;
  onToggleMission: (questId: string, missionId: string, completed: boolean) => void;
  onToggleEvidence: (questId: string | null) => void;
};

export default function QuestDetailModal({
  quest,
  open,
  initialEditMode = false,
  actionQuestId,
  savingQuestId = null,
  startingQuestId = null,
  togglingMissionId,
  showEvidenceForId,
  evidenceUrl,
  skillOptions = [],
  onClose,
  onEvidenceUrlChange,
  onStart,
  onComplete,
  onCancel,
  onReopen,
  onSave,
  onToggleMission,
  onToggleEvidence,
}: QuestDetailModalProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<(typeof QUEST_TYPES)[number]>("WORK");
  const [editDifficulty, setEditDifficulty] = useState<(typeof QUEST_DIFFICULTIES)[number]>("MEDIUM");
  const [editSkillId, setEditSkillId] = useState("");
  const [editMissions, setEditMissions] = useState<QuestMissionDraft[]>([{ title: "" }]);
  const isSaving = quest !== null && savingQuestId === quest.id;

  useEffect(() => {
    if (!open || !quest) {
      setIsEditing(false);
      setShowAdvanced(false);
      return;
    }

    setIsEditing(initialEditMode && canEditQuest(quest));
    setShowAdvanced(false);
    setEditTitle(quest.title);
    setEditType(quest.type as any);
    setEditDifficulty(quest.difficulty as any);
    setEditSkillId(quest.skillAllocations?.[0]?.skillId ?? "");
    setEditMissions(missionDraftsFromQuest(quest));
  }, [initialEditMode, open, quest]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) {
        if (isEditing) {
          if (!quest) {
            return;
          }

          setIsEditing(false);
          setShowAdvanced(false);
          setEditTitle(quest.title);
          setEditType(quest.type as any);
          setEditDifficulty(quest.difficulty as any);
          setEditSkillId(quest.skillAllocations?.[0]?.skillId ?? "");
          setEditMissions(missionDraftsFromQuest(quest));
          return;
        }

        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing, isSaving, onClose, open, quest]);

  if (!open || !quest) {
    return null;
  }

  const activeQuest = quest;
  const isStarting = startingQuestId === activeQuest.id;
  const isBusy = actionQuestId === activeQuest.id;
  const editable = canEditQuest(activeQuest);
  const canComplete =
    activeQuest.status === "IN_PROGRESS" && allQuestMissionsCompleted(activeQuest);
  const missionDone = completedMissionCount(activeQuest);

  function handleStartEdit() {
    setEditTitle(activeQuest.title);
    setEditType(activeQuest.type as any);
    setEditDifficulty(activeQuest.difficulty as any);
    setEditSkillId(activeQuest.skillAllocations?.[0]?.skillId ?? "");
    setEditMissions(missionDraftsFromQuest(activeQuest));
    setShowAdvanced(false);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setShowAdvanced(false);
    setEditTitle(activeQuest.title);
    setEditType(activeQuest.type as any);
    setEditDifficulty(activeQuest.difficulty as any);
    setEditSkillId(activeQuest.skillAllocations?.[0]?.skillId ?? "");
    setEditMissions(missionDraftsFromQuest(activeQuest));
  }

  function handleSaveEdit() {
    if (!editTitle.trim() || !editSkillId) {
      return;
    }

    onSave(activeQuest.id, {
      title: editTitle.trim(),
      type: editType,
      difficulty: editDifficulty,
      skillAllocations: [{ skillId: editSkillId, xp: XP_BY_DIFFICULTY[editDifficulty] }],
      missions: buildUpdateQuestMissions(editMissions),
    });
  }

  return (
    <div className="ds-modal" role="presentation" onClick={isSaving ? undefined : onClose}>
      <div
        className="ds-modal__panel ds-quest-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quest-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ds-modal__head">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="grid gap-4">
                <div className="flex items-start gap-2">
                  <label className="grid gap-1.5 flex-1">
                    <span className="text-micro text-foreground-muted">{t("quests.titleLabel")}</span>
                    <input
                      className="ds-quest-board-card__input ds-focus"
                      value={editTitle}
                      disabled={isSaving}
                      onChange={(event) => setEditTitle(event.target.value)}
                    />
                  </label>
                  
                  <button
                    type="button"
                    className="mt-6 flex h-8 w-8 items-center justify-center rounded-sm text-foreground-muted hover:text-foreground hover:bg-white/5 transition-colors ds-focus"
                    title="Advanced Options"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="21" x2="4" y2="14"></line>
                      <line x1="4" y1="10" x2="4" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12" y2="3"></line>
                      <line x1="20" y1="21" x2="20" y2="16"></line>
                      <line x1="20" y1="12" x2="20" y2="3"></line>
                      <line x1="1" y1="14" x2="7" y2="14"></line>
                      <line x1="9" y1="8" x2="15" y2="8"></line>
                      <line x1="17" y1="16" x2="23" y2="16"></line>
                    </svg>
                  </button>
                </div>

                {showAdvanced && (
                  <div className="grid gap-3 sm:grid-cols-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="grid gap-1.5">
                      <span className="text-micro text-foreground-muted">{t("quests.type")}</span>
                      <select
                        className="ds-quest-board-card__input ds-focus py-1"
                        value={editType}
                        disabled={isSaving}
                        onChange={(event) => setEditType(event.target.value as any)}
                      >
                        {QUEST_TYPES.map((qt) => (
                          <option key={qt} value={qt}>{qt}</option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-1.5">
                      <span className="text-micro text-foreground-muted">{t("quests.difficulty")}</span>
                      <select
                        className="ds-quest-board-card__input ds-focus py-1"
                        value={editDifficulty}
                        disabled={isSaving}
                        onChange={(event) => setEditDifficulty(event.target.value as any)}
                      >
                        {QUEST_DIFFICULTIES.map((qd) => (
                          <option key={qd} value={qd}>
                            {qd} ({XP_BY_DIFFICULTY[qd]} {t("common.xp")})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-1.5">
                      <span className="text-micro text-foreground-muted">{t("quests.skill")}</span>
                      <select
                        className="ds-quest-board-card__input ds-focus py-1"
                        value={editSkillId}
                        disabled={isSaving || skillOptions.length === 0}
                        onChange={(event) => setEditSkillId(event.target.value)}
                      >
                        {skillOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <>
                <h3 id="quest-detail-title" className="ds-modal__title">
                  {activeQuest.title}
                </h3>
                <p className="ds-quest-detail-modal__meta">
                  {activeQuest.type} · {activeQuest.difficulty} ·{" "}
                  <span className="text-xp">{activeQuest.baseXp} {t("common.xp")}</span>
                </p>
              </>
            )}
          </div>
          <div className="ds-modal__actions">
            {editable && !isEditing && (
              <button
                type="button"
                className="ds-modal__action-btn ds-focus"
                disabled={isBusy || isSaving}
                onClick={handleStartEdit}
              >
                {t("quests.edit")}
              </button>
            )}
            <button
              type="button"
              className="ds-modal__action-btn ds-focus"
              onClick={onClose}
              disabled={isSaving}
            >
              {t("common.close")}
            </button>
          </div>
        </div>

        {!isEditing && activeQuest.description && (
          <p className="ds-quest-detail-modal__description">{activeQuest.description}</p>
        )}

        {isEditing ? (
          <div className="mt-6">
            <QuestMissionFields
              missions={editMissions}
              disabled={isSaving}
              onChange={setEditMissions}
            />
          </div>
        ) : (
          activeQuest.missions.length > 0 && (
            <div className="ds-quest-board-card__missions ds-quest-detail-modal__missions">
              <p className="ds-quest-board-card__missions-label">
                {t("quests.missionsProgress", {
                  completed: missionDone,
                  total: activeQuest.missions.length,
                })}
              </p>
              <ul className="ds-quest-board-card__mission-list">
                {activeQuest.missions.map((mission) => (
                  <li key={mission.id}>
                    <label className="ds-quest-board-card__mission">
                      <input
                        type="checkbox"
                        checked={mission.isCompleted}
                        disabled={
                          activeQuest.status !== "IN_PROGRESS" ||
                          togglingMissionId === mission.id ||
                          isBusy
                        }
                        onChange={(event) =>
                          onToggleMission(activeQuest.id, mission.id, event.target.checked)
                        }
                      />
                      <span className={mission.isCompleted ? "line-through opacity-70" : ""}>
                        <LinkifiedText text={mission.title} />
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}

        <div className="ds-quest-detail-modal__actions">
          {isEditing ? (
            <>
              <button
                type="button"
                className="ds-skill-create-modal__cancel w-full text-center"
                disabled={isSaving}
                onClick={handleCancelEdit}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="ds-btn-primary-compact w-full"
                disabled={isSaving || !editTitle.trim()}
                onClick={handleSaveEdit}
              >
                {isSaving ? t("quests.saving") : t("quests.save")}
              </button>
            </>
          ) : (
            <>
              {activeQuest.status === "TODO" && (
                <button
                  type="button"
                  className="ds-btn-primary-compact w-full"
                  disabled={isBusy || isStarting}
                  onClick={() => onStart(activeQuest.id)}
                >
                  {isStarting ? t("dashboard.startingQuest") : t("quests.start")}
                </button>
              )}

              {activeQuest.status === "IN_PROGRESS" && (
                <>
                  <button
                    type="button"
                    className="ds-btn-success w-full disabled:opacity-50"
                    disabled={isBusy || !canComplete}
                    onClick={() =>
                      onToggleEvidence(
                        showEvidenceForId === activeQuest.id ? null : activeQuest.id,
                      )
                    }
                  >
                    {t("quests.complete")}
                  </button>
                  <button
                    type="button"
                    className="ds-quest-board-card__ghost-btn w-full text-center"
                    disabled={isBusy}
                    onClick={() => onCancel(activeQuest.id)}
                  >
                    {t("quests.cancel")}
                  </button>
                </>
              )}

              {activeQuest.status === "COMPLETED" && (
                <div className="flex w-full flex-col items-end gap-2">
                  <Badge variant="success">
                    {t(`enums.questStatus.${activeQuest.status}`, {
                      defaultValue: activeQuest.status,
                    })}
                  </Badge>
                  <button
                    type="button"
                    className={questReopenPillButtonClass}
                    disabled={isBusy}
                    onClick={() => onReopen(activeQuest.id)}
                  >
                    {isBusy
                      ? t("quests.reopening", { defaultValue: "Reopening…" })
                      : t("quests.reopen", { defaultValue: "Reopen" })}
                  </button>
                </div>
              )}

              {activeQuest.status === "CANCELLED" && (
                <div className="flex w-full flex-col items-end gap-2">
                  <span className={questStatusPillClass(activeQuest.status)}>
                    {t(`enums.questStatus.${activeQuest.status}`, {
                      defaultValue: activeQuest.status,
                    })}
                  </span>
                  <button
                    type="button"
                    className={questReopenPillButtonClass}
                    disabled={isBusy}
                    onClick={() => onReopen(activeQuest.id)}
                  >
                    {isBusy
                      ? t("quests.reopening", { defaultValue: "Reopening…" })
                      : t("quests.reopen", { defaultValue: "Reopen" })}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {showEvidenceForId === activeQuest.id &&
          activeQuest.status === "IN_PROGRESS" &&
          !isEditing && (
          <div className="ds-quest-board-card__evidence">
            <label className="grid gap-1.5 text-micro text-foreground-muted">
              <span>{t("common.evidenceUrlOptional")}</span>
              <input
                className="ds-quest-board-card__input ds-focus"
                value={evidenceUrl}
                onChange={(event) => onEvidenceUrlChange(event.target.value)}
                placeholder={t("common.evidencePlaceholder")}
              />
            </label>
            <button
              type="button"
              className="ds-btn-success w-full"
              disabled={isBusy}
              onClick={() => onComplete(activeQuest.id)}
            >
              {t("common.confirmComplete")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
