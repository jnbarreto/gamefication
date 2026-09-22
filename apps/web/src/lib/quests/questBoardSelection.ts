import { useCallback, useEffect, useMemo, useState } from "react";

export type QuestBoard = {
  id: string;
  name: string;
  questIds: string[];
  createdAt: string;
};

export type QuestBoardsData = {
  activeBoardId: string;
  boards: QuestBoard[];
};

const BOARDS_STORAGE_KEY = "gamefication:quest-boards";
const LEGACY_STORAGE_KEY = "gamefication:quest-board:ids";

function createDefaultBoard(questIds: string[] = []): QuestBoard {
  return {
    id: "default",
    name: "Quadro Principal",
    questIds,
    createdAt: new Date().toISOString(),
  };
}

function readStoredBoards(): QuestBoardsData {
  try {
    const raw = localStorage.getItem(BOARDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<QuestBoardsData>;
      if (
        parsed &&
        typeof parsed === "object" &&
        Array.isArray(parsed.boards) &&
        parsed.boards.length > 0
      ) {
        const boards: QuestBoard[] = parsed.boards
          .filter(
            (b): b is QuestBoard =>
              Boolean(b) &&
              typeof b.id === "string" &&
              typeof b.name === "string" &&
              Array.isArray(b.questIds),
          )
          .map((b) => ({
            id: b.id,
            name: b.name,
            questIds: b.questIds.filter((id): id is string => typeof id === "string"),
            createdAt:
              typeof b.createdAt === "string" ? b.createdAt : new Date().toISOString(),
          }));

        if (boards.length > 0) {
          const activeBoardId =
            typeof parsed.activeBoardId === "string" &&
            boards.some((b) => b.id === parsed.activeBoardId)
              ? parsed.activeBoardId
              : boards[0].id;

          return { activeBoardId, boards };
        }
      }
    }

    // Check legacy storage
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed)) {
        const oldIds = legacyParsed.filter(
          (item): item is string => typeof item === "string",
        );
        const defaultBoard = createDefaultBoard(oldIds);
        return {
          activeBoardId: defaultBoard.id,
          boards: [defaultBoard],
        };
      }
    }

    const defaultBoard = createDefaultBoard([]);
    return {
      activeBoardId: defaultBoard.id,
      boards: [defaultBoard],
    };
  } catch {
    const defaultBoard = createDefaultBoard([]);
    return {
      activeBoardId: defaultBoard.id,
      boards: [defaultBoard],
    };
  }
}

export function useQuestBoards() {
  const [data, setData] = useState<QuestBoardsData>(readStoredBoards);

  useEffect(() => {
    try {
      localStorage.setItem(BOARDS_STORAGE_KEY, JSON.stringify(data));
      const active =
        data.boards.find((b) => b.id === data.activeBoardId) ?? data.boards[0];
      if (active) {
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(active.questIds));
      }
    } catch {
      // ignore storage error
    }
  }, [data]);

  const activeBoard = useMemo(() => {
    return data.boards.find((b) => b.id === data.activeBoardId) ?? data.boards[0];
  }, [data.boards, data.activeBoardId]);

  const activeBoardId = activeBoard.id;
  const selectedIds = activeBoard.questIds;
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const setActiveBoardId = useCallback((id: string) => {
    setData((current) => {
      if (current.boards.some((b) => b.id === id)) {
        return { ...current, activeBoardId: id };
      }
      return current;
    });
  }, []);

  const createBoard = useCallback((name: string) => {
    const trimmed = name.trim();
    const newBoard: QuestBoard = {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `board-${Date.now()}`,
      name: trimmed || `Quadro ${Date.now()}`,
      questIds: [],
      createdAt: new Date().toISOString(),
    };

    setData((current) => ({
      activeBoardId: newBoard.id,
      boards: [...current.boards, newBoard],
    }));

    return newBoard;
  }, []);

  const renameBoard = useCallback((boardId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setData((current) => ({
      ...current,
      boards: current.boards.map((b) =>
        b.id === boardId ? { ...b, name: trimmed } : b,
      ),
    }));
  }, []);

  const deleteBoard = useCallback((boardId: string) => {
    setData((current) => {
      if (current.boards.length <= 1) {
        return current;
      }
      const filtered = current.boards.filter((b) => b.id !== boardId);
      const newActive =
        current.activeBoardId === boardId ? filtered[0].id : current.activeBoardId;
      return {
        activeBoardId: newActive,
        boards: filtered,
      };
    });
  }, []);

  const addQuest = useCallback((questId: string) => {
    setData((current) => ({
      ...current,
      boards: current.boards.map((b) => {
        if (b.id !== current.activeBoardId) return b;
        if (b.questIds.includes(questId)) return b;
        return { ...b, questIds: [...b.questIds, questId] };
      }),
    }));
  }, []);

  const removeQuest = useCallback((questId: string) => {
    setData((current) => ({
      ...current,
      boards: current.boards.map((b) => {
        if (b.id !== current.activeBoardId) return b;
        return { ...b, questIds: b.questIds.filter((id) => id !== questId) };
      }),
    }));
  }, []);

  const pruneMissing = useCallback((validIds: Set<string>) => {
    setData((current) => {
      let changed = false;
      const nextBoards = current.boards.map((b) => {
        const nextIds = b.questIds.filter((id) => validIds.has(id));
        if (nextIds.length !== b.questIds.length) {
          changed = true;
          return { ...b, questIds: nextIds };
        }
        return b;
      });

      return changed ? { ...current, boards: nextBoards } : current;
    });
  }, []);

  const reorderQuests = useCallback((reorderedColumnQuestIds: string[]) => {
    setData((current) => {
      const active = current.boards.find((b) => b.id === current.activeBoardId);
      if (!active) return current;

      const reorderedSet = new Set(reorderedColumnQuestIds);
      let reorderedIndex = 0;

      const nextQuestIds = active.questIds.map((id) => {
        if (reorderedSet.has(id)) {
          const nextId = reorderedColumnQuestIds[reorderedIndex++];
          return nextId ?? id;
        }
        return id;
      });

      return {
        ...current,
        boards: current.boards.map((b) =>
          b.id === current.activeBoardId ? { ...b, questIds: nextQuestIds } : b,
        ),
      };
    });
  }, []);

  return {
    boards: data.boards,
    activeBoard,
    activeBoardId,
    selectedIds,
    selectedIdSet,
    setActiveBoardId,
    createBoard,
    renameBoard,
    deleteBoard,
    addQuest,
    removeQuest,
    pruneMissing,
    reorderQuests,
  };
}

export const useQuestBoardSelection = useQuestBoards;
