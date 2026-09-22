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
  skillOptions,
}: QuestKanbanViewProps) {
  const { t } = useTranslation();
  const [detailQuestId, setDetailQuestId] = useState<string | null>(null);
  const detailQuest = quests.find((quest) => quest.id === detailQuestId) ?? null;

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

    for (const list of grouped.values()) {
      list.sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      );
    }

    return grouped;
  }, [quests]);

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

            <div className="ds-quest-kanban__column-body">
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
          <div className="ds-quest-kanban__column-body">
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
