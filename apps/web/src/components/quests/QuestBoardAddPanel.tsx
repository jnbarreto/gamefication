import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { QuestResponse } from "@/lib/api/types";
import { QUEST_DIFFICULTIES, QUEST_TYPES } from "@/lib/constants/quest";

type QuestBoardAddPanelProps = {
  quests: QuestResponse[];
  selectedIdSet: Set<string>;
  skillOptions: Array<{ id: string; label: string }>;
  onAddQuest: (questId: string) => void;
};

type FilterValue = "ALL" | string;

function matchesSearch(quest: QuestResponse, query: string): boolean {
  const haystack = [
    quest.title,
    quest.type,
    quest.difficulty,
    quest.status,
    ...quest.missions.map((mission) => mission.title),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function matchesFilters(
  quest: QuestResponse,
  typeFilter: FilterValue,
  difficultyFilter: FilterValue,
  skillFilter: FilterValue,
): boolean {
  if (typeFilter !== "ALL" && quest.type !== typeFilter) {
    return false;
  }

  if (difficultyFilter !== "ALL" && quest.difficulty !== difficultyFilter) {
    return false;
  }

  if (
    skillFilter !== "ALL" &&
    !quest.skillAllocations.some((allocation) => allocation.skillId === skillFilter)
  ) {
    return false;
  }

  return true;
}

export default function QuestBoardAddPanel({
  quests,
  selectedIdSet,
  skillOptions,
  onAddQuest,
}: QuestBoardAddPanelProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterValue>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<FilterValue>("ALL");
  const [skillFilter, setSkillFilter] = useState<FilterValue>("ALL");

  const skillLabelById = useMemo(
    () => new Map(skillOptions.map((option) => [option.id, option.label])),
    [skillOptions],
  );

  const availableQuests = useMemo(
    () =>
      quests
        .filter((quest) => !selectedIdSet.has(quest.id) && quest.status !== "CANCELLED")
        .sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
        ),
    [quests, selectedIdSet],
  );

  const skillFilterOptions = useMemo(() => {
    const skillIds = new Set<string>();

    for (const quest of availableQuests) {
      for (const allocation of quest.skillAllocations) {
        skillIds.add(allocation.skillId);
      }
    }

    return skillOptions
      .filter((option) => skillIds.has(option.id))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [availableQuests, skillOptions]);

  const filteredQuests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return availableQuests.filter((quest) => {
      if (!matchesFilters(quest, typeFilter, difficultyFilter, skillFilter)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return matchesSearch(quest, query);
    });
  }, [availableQuests, searchQuery, typeFilter, difficultyFilter, skillFilter]);

  function resetPanelState() {
    setSearchQuery("");
    setTypeFilter("ALL");
    setDifficultyFilter("ALL");
    setSkillFilter("ALL");
  }

  function closePanel() {
    setOpen(false);
    resetPanelState();
  }

  function handleToggleOpen() {
    setOpen((current) => {
      if (current) {
        resetPanelState();
      }

      return !current;
    });
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closePanel();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="ds-quest-board-add">
      <button
        type="button"
        className="ds-btn-primary-compact ds-focus"
        onClick={handleToggleOpen}
        aria-expanded={open}
      >
        {t("questBoard.addQuest")}
      </button>

      {open && (
        <div className="ds-quest-board-add__panel">
          <label className="ds-quest-board-add__search">
            <span className="sr-only">{t("questBoard.searchQuests")}</span>
            <input
              type="search"
              className="ds-quest-board-add__search-input ds-focus"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("questBoard.searchQuests")}
              autoFocus
            />
          </label>

          <div className="ds-quest-board-add__filters">
            <label className="ds-quest-board-add__filter">
              <span className="ds-quest-board-add__filter-label">
                {t("quests.type")}
              </span>
              <select
                className="ds-quest-board-add__filter-input ds-focus"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="ALL">{t("questBoard.filterAll")}</option>
                {QUEST_TYPES.map((questType) => (
                  <option key={questType} value={questType}>
                    {questType}
                  </option>
                ))}
              </select>
            </label>

            <label className="ds-quest-board-add__filter">
              <span className="ds-quest-board-add__filter-label">
                {t("quests.difficulty")}
              </span>
              <select
                className="ds-quest-board-add__filter-input ds-focus"
                value={difficultyFilter}
                onChange={(event) => setDifficultyFilter(event.target.value)}
              >
                <option value="ALL">{t("questBoard.filterAll")}</option>
                {QUEST_DIFFICULTIES.map((questDifficulty) => (
                  <option key={questDifficulty} value={questDifficulty}>
                    {questDifficulty}
                  </option>
                ))}
              </select>
            </label>

            <label className="ds-quest-board-add__filter">
              <span className="ds-quest-board-add__filter-label">
                {t("quests.skill")}
              </span>
              <select
                className="ds-quest-board-add__filter-input ds-focus"
                value={skillFilter}
                onChange={(event) => setSkillFilter(event.target.value)}
                disabled={skillFilterOptions.length === 0}
              >
                <option value="ALL">{t("questBoard.filterAll")}</option>
                {skillFilterOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {availableQuests.length === 0 ? (
            <p className="ds-empty">{t("questBoard.noAvailableQuests")}</p>
          ) : filteredQuests.length === 0 ? (
            <p className="ds-empty">{t("questBoard.searchQuestsEmpty")}</p>
          ) : (
            <ul className="ds-quest-board-add__list">
              {filteredQuests.map((quest) => (
                <li key={quest.id} className="ds-quest-board-add__item">
                  <div className="min-w-0">
                    <p className="ds-quest-board-add__title">{quest.title}</p>
                    <p className="ds-quest-board-add__meta">
                      {t(`enums.questStatus.${quest.status}`, {
                        defaultValue: quest.status,
                      })}{" "}
                      · {quest.type} · {quest.difficulty}
                      {quest.skillAllocations[0] && (
                        <>
                          {" "}
                          ·{" "}
                          {skillLabelById.get(quest.skillAllocations[0]!.skillId) ??
                            quest.skillAllocations[0]!.skillId}
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ds-quest-board-add__btn ds-focus"
                    onClick={() => onAddQuest(quest.id)}
                  >
                    {t("questBoard.addToBoard")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
