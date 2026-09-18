import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { QuestMissionDraft } from "@/lib/quests/questEditForm";

type QuestMissionFieldsProps = {
  missions: QuestMissionDraft[];
  disabled?: boolean;
  onChange: (missions: QuestMissionDraft[]) => void;
};

export default function QuestMissionFields({
  missions,
  disabled = false,
  onChange,
}: QuestMissionFieldsProps) {
  const { t } = useTranslation();

  function handleMissionTitleChange(index: number, title: string) {
    onChange(
      missions.map((mission, missionIndex) =>
        missionIndex === index ? { ...mission, title } : mission,
      ),
    );
  }

  function handleAddMission() {
    onChange([...missions, { title: "" }]);
  }

  function handleRemoveMission(index: number) {
    onChange(missions.filter((_, missionIndex) => missionIndex !== index));
  }

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  function handleDragStart(index: number, event: React.DragEvent<HTMLDivElement>) {
    if (disabled) {
      event.preventDefault();
      return;
    }
    setDraggedIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", index.toString());
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault(); // Necessary to allow dropping
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(index: number, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newMissions = [...missions];
    const draggedItem = newMissions[draggedIndex]!;
    newMissions.splice(draggedIndex, 1);
    newMissions.splice(index, 0, draggedItem);
    
    onChange(newMissions);
    setDraggedIndex(null);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddMission();
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-micro text-foreground-muted">{t("quests.missionsLabel")}</span>
        <button
          type="button"
          className="text-micro text-accent disabled:opacity-50"
          disabled={disabled}
          onClick={handleAddMission}
        >
          {t("quests.addMission")}
        </button>
      </div>
      <p className="text-micro text-foreground-muted">{t("quests.missionsHint")}</p>
      <div className="grid gap-2">
        {missions.map((mission, index) => (
          <div 
            key={mission.id ?? `new-${index}`} 
            className={`flex items-center gap-2 transition-opacity ${draggedIndex === index ? "opacity-50" : "opacity-100"}`}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(index, e)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(index, e)}
            onDragEnd={handleDragEnd}
          >
            <div className="cursor-grab active:cursor-grabbing text-foreground-muted/50 hover:text-foreground-muted flex h-8 w-6 items-center justify-center -ml-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="12" r="1"></circle>
                <circle cx="9" cy="5" r="1"></circle>
                <circle cx="9" cy="19" r="1"></circle>
                <circle cx="15" cy="12" r="1"></circle>
                <circle cx="15" cy="5" r="1"></circle>
                <circle cx="15" cy="19" r="1"></circle>
              </svg>
            </div>
            <input
              className="ds-quest-board-card__input ds-focus min-w-0 flex-1"
              value={mission.title}
              disabled={disabled}
              onChange={(event) => handleMissionTitleChange(index, event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${t("quests.missions")} ${index + 1}`}
            />
            <button
              type="button"
              className="ds-quest-board-card__remove ds-focus"
              disabled={disabled || missions.length === 1}
              onClick={() => handleRemoveMission(index)}
              aria-label={t("quests.removeMission")}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
