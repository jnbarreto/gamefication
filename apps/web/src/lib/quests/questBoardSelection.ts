import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "gamefication:quest-board:ids";

function readStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function useQuestBoardSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>(readStoredIds);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const addQuest = useCallback((questId: string) => {
    setSelectedIds((current) =>
      current.includes(questId) ? current : [...current, questId],
    );
  }, []);

  const removeQuest = useCallback((questId: string) => {
    setSelectedIds((current) => current.filter((id) => id !== questId));
  }, []);

  const pruneMissing = useCallback((validIds: Set<string>) => {
    setSelectedIds((current) => current.filter((id) => validIds.has(id)));
  }, []);

  return {
    selectedIds,
    selectedIdSet,
    addQuest,
    removeQuest,
    pruneMissing,
  };
}
