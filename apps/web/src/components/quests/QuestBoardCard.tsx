import { type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import { Badge, questItemClass } from "@/components/design";
import type { QuestResponse } from "@/lib/api/types";
import { completedMissionCount } from "@/lib/quests/questMissionProgress";
import { questReopenPillButtonClass } from "@/lib/quests/questStatusPill";

type QuestBoardCardProps = {
  quest: QuestResponse;
  compact?: boolean;
  actionQuestId: string | null;
  startingQuestId?: string | null;
  onOpenDetail: () => void;
  onStart: (questId: string) => void;
  onReopen?: (questId: string) => void;
  onRemoveFromBoard?: (questId: string) => void;
};

type MissionPreviewRowProps = {
  title: string;
  isCompleted: boolean;
};

import { LinkifiedText } from "../ui/LinkifiedText";

function MissionPreviewRow({ title, isCompleted }: MissionPreviewRowProps) {
  return (
    <div className="ds-quest-board-card__mission ds-quest-board-card__mission--preview">
      <input
        type="checkbox"
        checked={isCompleted}
        disabled
        readOnly
        tabIndex={-1}
        aria-hidden="true"
      />
      <span
        className="ds-quest-board-card__mission-preview-text"
        title={title}
      >
        <span className={isCompleted ? "line-through opacity-70" : ""}>
          <LinkifiedText text={title} />
        </span>
      </span>
    </div>
  );
}

export default function QuestBoardCard({
  quest,
  compact = false,
  actionQuestId,
  startingQuestId = null,
  onOpenDetail,
  onStart,
  onReopen,
  onRemoveFromBoard,
}: QuestBoardCardProps) {
  const { t } = useTranslation();
  const isStarting = startingQuestId === quest.id;
  const isBusy = actionQuestId === quest.id;
  const missionTotal = quest.missions.length;
  const missionDone = completedMissionCount(quest);

  function handleCardClick() {
    onOpenDetail();
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenDetail();
    }
  }

  return (
    <article
      className={`${questItemClass(quest.status, quest.type)} ds-quest-board-card ds-quest-board-card--fixed ${compact ? "ds-quest-board-card--compact" : ""}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      aria-label={t("quests.openDetails", { title: quest.title })}
    >
      <header className="ds-quest-board-card__head">
        <div className="flex items-start justify-between gap-2">
          <h4 className="ds-quest-board-card__title line-clamp-2" title={quest.title}>
            {quest.title}
          </h4>
          <div
            className="flex shrink-0 flex-col items-end gap-1"
            onClick={(event) => event.stopPropagation()}
          >
            {onRemoveFromBoard && (
              <button
                type="button"
                className="ds-quest-board-card__remove ds-focus"
                onClick={() => onRemoveFromBoard(quest.id)}
                aria-label={t("questBoard.removeFromBoard")}
              >
                ×
              </button>
            )}

            {(quest.status === "CANCELLED" || quest.status === "COMPLETED") && onReopen && (
              <button
                type="button"
                className={questReopenPillButtonClass}
                disabled={isBusy}
                onClick={() => onReopen(quest.id)}
              >
                {isBusy
                  ? t("quests.reopening", { defaultValue: "Reopening…" })
                  : t("quests.reopen", { defaultValue: "Reopen" })}
              </button>
            )}
          </div>
        </div>
        <p className="ds-quest-board-card__meta">
          {quest.type} · {quest.difficulty} ·{" "}
          <span className="text-xp">{quest.baseXp} {t("common.xp")}</span>
        </p>
      </header>

      {missionTotal > 0 ? (
        <div className="ds-quest-board-card__missions ds-quest-board-card__missions--preview">
          <div className="mb-1.5 flex shrink-0 items-center justify-between gap-1">
            <p className="ds-quest-board-card__missions-label mb-0">
              {t("quests.missionsProgress", {
                completed: missionDone,
                total: missionTotal,
              })}
            </p>
            {missionTotal > 3 && (
              <span className="text-micro font-mono text-foreground-muted/60 shrink-0">
                +{missionTotal - 3}
              </span>
            )}
          </div>
          <ul className="ds-quest-board-card__mission-list ds-quest-board-card__mission-list--preview">
            {quest.missions.map((mission) => (
              <li key={mission.id}>
                <MissionPreviewRow
                  title={mission.title}
                  isCompleted={mission.isCompleted}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="ds-quest-board-card__missions ds-quest-board-card__missions--empty">
          <p className="ds-quest-board-card__missions-empty-text">
            {t("quests.noMissions", { defaultValue: "Sem missões" })}
          </p>
        </div>
      )}

      <footer
        className="ds-quest-board-card__actions"
        onClick={(event) => event.stopPropagation()}
      >
        {quest.status === "TODO" && (
          <button
            type="button"
            className="ds-btn-primary-compact w-full h-full flex items-center justify-center"
            disabled={isBusy || isStarting}
            onClick={() => onStart(quest.id)}
          >
            {isStarting ? t("dashboard.startingQuest") : t("quests.start")}
          </button>
        )}

        {quest.status === "IN_PROGRESS" && (
          <Badge
            variant="accent"
            className="w-full h-full flex items-center justify-center py-0"
          >
            {t(`enums.questStatus.${quest.status}`, { defaultValue: quest.status })}
          </Badge>
        )}

        {quest.status === "COMPLETED" && (
          <Badge
            variant="success"
            className="w-full h-full flex items-center justify-center py-0"
          >
            {t(`enums.questStatus.${quest.status}`, { defaultValue: quest.status })}
          </Badge>
        )}

        {quest.status === "CANCELLED" && (
          <Badge
            variant="muted"
            className="w-full h-full flex items-center justify-center py-0"
          >
            {t(`enums.questStatus.${quest.status}`, { defaultValue: quest.status })}
          </Badge>
        )}
      </footer>
    </article>
  );
}
