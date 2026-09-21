import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { UpdateQuestRequest } from "@/lib/api/quests";
import type { QuestResponse } from "@/lib/api/types";

import QuestBoardCard from "./QuestBoardCard";
import QuestDetailModal from "./QuestDetailModal";

type QuestCardsViewProps = {
  quests: QuestResponse[];
  maxCards?: number;
  actionQuestId: string | null;
  startingQuestId?: string | null;
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

export default function QuestCardsView({
  quests,
  maxCards,
  actionQuestId,
  startingQuestId = null,
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
}: QuestCardsViewProps) {
  const { t } = useTranslation();
  const [detailQuestId, setDetailQuestId] = useState<string | null>(null);
  const [detailEditMode, setDetailEditMode] = useState(false);
  const visibleQuests = typeof maxCards === "number" ? quests.slice(0, maxCards) : quests;
  const detailQuest = visibleQuests.find((quest) => quest.id === detailQuestId) ?? null;

  if (visibleQuests.length === 0) {
    return <p className="ds-empty">{t("questBoard.cardsEmpty")}</p>;
  }

  return (
    <>
      <div className="ds-quest-cards">
        {visibleQuests.map((quest) => (
          <QuestBoardCard
            key={quest.id}
            quest={quest}
            actionQuestId={actionQuestId}
            startingQuestId={startingQuestId}
            onOpenDetail={() => {
              setDetailEditMode(false);
              setDetailQuestId(quest.id);
            }}
            onStart={onStart}
            onReopen={onReopen}
            onRemoveFromBoard={onRemoveFromBoard}
          />
        ))}
      </div>

      <QuestDetailModal
        quest={detailQuest}
        open={detailQuest !== null}
        initialEditMode={detailEditMode}
        actionQuestId={actionQuestId}
        savingQuestId={savingQuestId}
        startingQuestId={startingQuestId}
        togglingMissionId={togglingMissionId}
        showEvidenceForId={showEvidenceForId}
        evidenceUrl={evidenceUrl}
        skillOptions={skillOptions}
        onClose={() => {
          setDetailQuestId(null);
          setDetailEditMode(false);
          onToggleEvidence(null);
        }}
        onEvidenceUrlChange={onEvidenceUrlChange}
        onStart={onStart}
        onComplete={onComplete}
        onCancel={onCancel}
        onReopen={onReopen}
        onSave={(questId, input) => {
          onSave(questId, input);
        }}
        onToggleMission={onToggleMission}
        onToggleEvidence={onToggleEvidence}
      />
    </>
  );
}
