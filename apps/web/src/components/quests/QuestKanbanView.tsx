import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { UpdateQuestRequest } from "@/lib/api/quests";
import type { QuestResponse } from "@/lib/api/types";
import { QUEST_STATUSES } from "@/lib/constants/quest";

import QuestBoardCard from "./QuestBoardCard";
import QuestDetailModal from "./QuestDetailModal";

type QuestKanbanViewProps = {
  quests: QuestResponse[];
  showCancelled: boolean;
  hideMissions?: boolean;
  actionQuestId: string | null;
  togglingMissionId: string | null;
  showEvidenceForId: string | null;
  evidenceUrl: string;
  onEvidenceUrlChange: (value: string) => void;
  onStart: (questId: string) => void;
  onComplete: (questId: string) => void;
  onCancel: (questId: string) => void;
  onReopen: (questId: string) => void;
  onSave: (questId: string, input: UpdateQuestRequest) => void;
  savingQuestId?: string | null;
  onToggleMission: (questId: string, missionId: string, completed: boolean) => void;
  onToggleEvidence: (questId: string | null) => void;
  onRemoveFromBoard?: (questId: string) => void;
  onReorderQuests?: (reorderedIds: string[]) => void;
  skillOptions?: Array<{ id: string; label: string }>;
};

const KANBAN_COLUMNS = ["TODO", "IN_PROGRESS", "COMPLETED"] as const;

export default function QuestKanbanView({
  quests,
  showCancelled,
  hideMissions = false,
  actionQuestId,
  togglingMissionId,
  showEvidenceForId,
  evidenceUrl,
  onEvidenceUrlChange,
  onStart,
  onComplete,
  onCancel,
  onReopen,
  onSave,
  savingQuestId = null,
  onToggleMission,
  onToggleEvidence,
  onRemoveFromBoard,
  onReorderQuests,
  skillOptions,
}: QuestKanbanViewProps) {
  const { t } = useTranslation();
  const [detailQuestId, setDetailQuestId] = useState<string | null>(null);
  const detailQuest = quests.find((quest) => quest.id === detailQuestId) ?? null;

  const [draggedQuestId, setDraggedQuestId] = useState<string | null>(null);
  const [draggedStatus, setDraggedStatus] = useState<string | null>(null);
  const [dragOverQuestId, setDragOverQuestId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"above" | "below" | null>(null);

  const questsByStatus = useMemo(() => {
    const grouped = new Map<string, QuestResponse[]>();

    for (const status of QUEST_STATUSES) {
      grouped.set(status, []);
    }

    for (const quest of quests) {
      const list = grouped.get(quest.status) ?? [];
      list.push(quest);
      grouped.set(quest.status, list);
    }

    return grouped;
  }, [quests]);

  function handleCardDragStart(quest: QuestResponse, event: React.DragEvent<HTMLElement>) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", quest.id);
    setDraggedQuestId(quest.id);
    setDraggedStatus(quest.status);
  }

  function handleCardDragEnd() {
    setDraggedQuestId(null);
    setDraggedStatus(null);
    setDragOverQuestId(null);
    setDropPosition(null);
  }

  function handleCardDragOver(quest: QuestResponse, event: React.DragEvent<HTMLElement>) {
    // CRITICAL: ONLY allow dragging within the SAME column!
    if (draggedStatus !== quest.status || draggedQuestId === quest.id) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";

    const rect = event.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = event.clientY < midY ? "above" : "below";

    setDragOverQuestId(quest.id);
    setDropPosition(position);
  }

  function handleCardDragLeave(quest: QuestResponse) {
    if (dragOverQuestId === quest.id) {
      setDragOverQuestId(null);
      setDropPosition(null);
    }
  }

  function handleCardDrop(targetQuest: QuestResponse, event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();

    // ONLY allow reordering within the same column!
    if (
      !draggedQuestId ||
      draggedStatus !== targetQuest.status ||
      draggedQuestId === targetQuest.id
    ) {
      handleCardDragEnd();
      return;
    }

    const columnQuests = questsByStatus.get(targetQuest.status) ?? [];
    const currentIds = columnQuests.map((q) => q.id);
    const fromIndex = currentIds.indexOf(draggedQuestId);
    if (fromIndex === -1) {
      handleCardDragEnd();
      return;
    }

    const newIds = currentIds.filter((id) => id !== draggedQuestId);
    const targetIndex = newIds.indexOf(targetQuest.id);
    const insertIndex = dropPosition === "below" ? targetIndex + 1 : targetIndex;
    newIds.splice(insertIndex, 0, draggedQuestId);

    onReorderQuests?.(newIds);
    handleCardDragEnd();
  }

  function handleColumnDragOver(status: string, event: React.DragEvent<HTMLElement>) {
    // ONLY allow drag-over if dragging a card from THIS SAME column
    if (draggedStatus === status) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }
  }

  function handleColumnDrop(status: string, event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    if (draggedStatus !== status || !draggedQuestId) {
      handleCardDragEnd();
      return;
    }

    const columnQuests = questsByStatus.get(status) ?? [];
    const currentIds = columnQuests.map((q) => q.id);
    const fromIndex = currentIds.indexOf(draggedQuestId);
    if (fromIndex !== -1 && fromIndex !== currentIds.length - 1) {
      const newIds = currentIds.filter((id) => id !== draggedQuestId);
      newIds.push(draggedQuestId);
      onReorderQuests?.(newIds);
    }

    handleCardDragEnd();
  }

  const cancelledQuests = questsByStatus.get("CANCELLED") ?? [];

  if (quests.length === 0) {
    return <p className="ds-empty">{t("questBoard.kanbanEmpty")}</p>;
  }

  return (
    <>
    <div className="ds-quest-kanban">
      {KANBAN_COLUMNS.map((status) => {
        const columnQuests = questsByStatus.get(status) ?? [];

        return (
          <section key={status} className="ds-quest-kanban__column">
            <header className="ds-quest-kanban__column-head">
              <h3 className="ds-quest-kanban__column-title">
                {t(`enums.questStatus.${status}`, { defaultValue: status })}
              </h3>
              <span className="ds-quest-kanban__column-count">{columnQuests.length}</span>
            </header>

            <div
              className="ds-quest-kanban__column-body"
              onDragOver={(e) => handleColumnDragOver(status, e)}
              onDrop={(e) => handleColumnDrop(status, e)}
            >
              {columnQuests.length === 0 ? (
                <p className="ds-quest-kanban__empty">{t("questBoard.kanbanEmptyColumn")}</p>
              ) : (
                columnQuests.map((quest) => (
                  <QuestBoardCard
                    key={quest.id}
                    quest={quest}
                    compact
                    hideMissions={hideMissions}
                    actionQuestId={actionQuestId}
                    onOpenDetail={() => setDetailQuestId(quest.id)}
                    onStart={onStart}
                    onReopen={onReopen}
                    onRemoveFromBoard={onRemoveFromBoard}
                    draggable={Boolean(onReorderQuests)}
                    onDragStart={(e) => handleCardDragStart(quest, e)}
                    onDragEnd={handleCardDragEnd}
                    onDragOver={(e) => handleCardDragOver(quest, e)}
                    onDragLeave={() => handleCardDragLeave(quest)}
                    onDrop={(e) => handleCardDrop(quest, e)}
                    isDragging={draggedQuestId === quest.id}
                    dropPosition={dragOverQuestId === quest.id ? dropPosition : null}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}

      {showCancelled && cancelledQuests.length > 0 && (
        <section className="ds-quest-kanban__column ds-quest-kanban__column--muted">
          <header className="ds-quest-kanban__column-head">
            <h3 className="ds-quest-kanban__column-title">
              {t("enums.questStatus.CANCELLED")}
            </h3>
            <span className="ds-quest-kanban__column-count">{cancelledQuests.length}</span>
          </header>
          <div
            className="ds-quest-kanban__column-body"
            onDragOver={(e) => handleColumnDragOver("CANCELLED", e)}
            onDrop={(e) => handleColumnDrop("CANCELLED", e)}
          >
            {cancelledQuests.map((quest) => (
              <QuestBoardCard
                key={quest.id}
                quest={quest}
                compact
                hideMissions={hideMissions}
                actionQuestId={actionQuestId}
                onOpenDetail={() => setDetailQuestId(quest.id)}
                onStart={onStart}
                onReopen={onReopen}
                onRemoveFromBoard={onRemoveFromBoard}
                draggable={Boolean(onReorderQuests)}
                onDragStart={(e) => handleCardDragStart(quest, e)}
                onDragEnd={handleCardDragEnd}
                onDragOver={(e) => handleCardDragOver(quest, e)}
                onDragLeave={() => handleCardDragLeave(quest)}
                onDrop={(e) => handleCardDrop(quest, e)}
                isDragging={draggedQuestId === quest.id}
                dropPosition={dragOverQuestId === quest.id ? dropPosition : null}
              />
            ))}
          </div>
        </section>
      )}
    </div>

    <QuestDetailModal
      quest={detailQuest}
      open={detailQuest !== null}
      actionQuestId={actionQuestId}
      togglingMissionId={togglingMissionId}
      showEvidenceForId={showEvidenceForId}
      evidenceUrl={evidenceUrl}
      skillOptions={skillOptions}
      onClose={() => {
        setDetailQuestId(null);
        onToggleEvidence(null);
      }}
      onEvidenceUrlChange={onEvidenceUrlChange}
      onStart={onStart}
      onComplete={onComplete}
      onCancel={onCancel}
      onReopen={onReopen}
      onSave={onSave}
      savingQuestId={savingQuestId}
      onToggleMission={onToggleMission}
      onToggleEvidence={onToggleEvidence}
    />
    </>
  );
}
