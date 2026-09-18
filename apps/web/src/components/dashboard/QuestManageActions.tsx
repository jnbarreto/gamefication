import { useTranslation } from "react-i18next";

import { Badge } from "@/components/design";
import type { QuestResponse } from "@/lib/api/types";
import {
  allQuestMissionsCompleted,
  completedMissionCount,
} from "@/lib/quests/questMissionProgress";

type QuestMissionListProps = {
  quest: QuestResponse;
  disabled?: boolean;
  togglingMissionId: string | null;
  onToggleMission: (questId: string, missionId: string, completed: boolean) => Promise<void>;
};

export default function QuestMissionList({
  quest,
  disabled = false,
  togglingMissionId,
  onToggleMission,
}: QuestMissionListProps) {
  const { t } = useTranslation();

  if (quest.missions.length === 0) {
    return null;
  }

  const completed = completedMissionCount(quest);

  return (
    <div className="ds-quest-missions">
      <p className="ds-quest-missions__heading">
        {t("quests.missionsProgress", {
          completed,
          total: quest.missions.length,
        })}
      </p>
      <ul className="ds-quest-missions__list">
        {quest.missions.map((mission) => (
          <li key={mission.id}>
            <label className="ds-quest-missions__item">
              <input
                type="checkbox"
                checked={mission.isCompleted}
                disabled={
                  disabled ||
                  quest.status !== "IN_PROGRESS" ||
                  togglingMissionId === mission.id
                }
                onChange={(event) =>
                  onToggleMission(quest.id, mission.id, event.target.checked)
                }
              />
              <span className={mission.isCompleted ? "line-through opacity-70" : ""}>
                {mission.title}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {quest.status === "IN_PROGRESS" && !allQuestMissionsCompleted(quest) && (
        <p className="ds-quest-missions__hint">{t("quests.completeMissionsHint")}</p>
      )}
    </div>
  );
}

type QuestManageActionsProps = {
  quest: QuestResponse;
  layout?: "card" | "row";
  startingQuestId: string | null;
  actionQuestId: string | null;
  togglingMissionId: string | null;
  onStartQuest: (questId: string) => Promise<void>;
  onCompleteQuest: (questId: string) => Promise<void>;
  onCancelQuest: (questId: string) => Promise<void>;
  onToggleMission: (questId: string, missionId: string, completed: boolean) => Promise<void>;
};

export function QuestManageActions({
  quest,
  layout = "row",
  startingQuestId,
  actionQuestId,
  togglingMissionId,
  onStartQuest,
  onCompleteQuest,
  onCancelQuest,
  onToggleMission,
}: QuestManageActionsProps) {
  const { t } = useTranslation();
  const isBusy = actionQuestId === quest.id || startingQuestId === quest.id;
  const canComplete =
    quest.status === "IN_PROGRESS" && allQuestMissionsCompleted(quest);

  return (
    <div className={layout === "card" ? "space-y-3" : "min-w-0 space-y-2"}>
      <QuestMissionList
        quest={quest}
        disabled={isBusy}
        togglingMissionId={togglingMissionId}
        onToggleMission={onToggleMission}
      />

      <div
        className={
          layout === "card"
            ? "flex flex-col gap-2"
            : "flex flex-wrap items-center justify-end gap-2"
        }
      >
        {quest.status === "TODO" && (
          <button
            type="button"
            disabled={startingQuestId === quest.id}
            onClick={() => onStartQuest(quest.id)}
            className={`ds-btn-primary-compact ${layout === "card" ? "w-full" : ""}`}
          >
            {startingQuestId === quest.id
              ? t("dashboard.startingQuest")
              : t("quests.start")}
          </button>
        )}

        {quest.status === "IN_PROGRESS" && (
          <>
            <button
              type="button"
              disabled={isBusy || !canComplete}
              onClick={() => onCompleteQuest(quest.id)}
              className={`ds-btn-success ${layout === "card" ? "w-full" : ""}`}
            >
              {actionQuestId === quest.id ? t("quests.completing") : t("quests.complete")}
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onCancelQuest(quest.id)}
              className={`ds-skill-create-modal__cancel ${layout === "card" ? "w-full text-center" : ""}`}
            >
              {actionQuestId === quest.id ? t("quests.cancelling") : t("quests.cancel")}
            </button>
          </>
        )}

        {quest.status !== "TODO" && quest.status !== "IN_PROGRESS" && (
          <Badge variant={quest.status === "COMPLETED" ? "success" : "muted"}>
            {t(`enums.questStatus.${quest.status}`, {
              defaultValue: quest.status,
            })}
          </Badge>
        )}
      </div>
    </div>
  );
}
