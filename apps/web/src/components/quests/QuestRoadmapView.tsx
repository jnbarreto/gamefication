import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { QuestResponse } from "@/lib/api/types";
import { useAppLocale } from "@/lib/i18n/useAppLocale";
import { completedMissionCount } from "@/lib/quests/questMissionProgress";
import {
  buildQuestTimelineSpans,
  buildRoadmapDays,
  dayColumnWidthPx,
  groupDaysByMonth,
  roadmapWidthPx,
  shiftRoadmapWindow,
} from "@/lib/quests/questRoadmap";

type QuestRoadmapViewProps = {
  quests: QuestResponse[];
};

function roadmapStatusDotClass(status: string, type?: string): string {
  if (type === "BOSS") {
    return "ds-quest-roadmap__status-dot--boss";
  }

  switch (status) {
    case "IN_PROGRESS":
      return "ds-quest-roadmap__status-dot--progress";
    case "COMPLETED":
      return "ds-quest-roadmap__status-dot--done";
    case "CANCELLED":
      return "ds-quest-roadmap__status-dot--cancelled";
    default:
      return "ds-quest-roadmap__status-dot--todo";
  }
}

function statusBarClass(status: string, type?: string): string {
  if (type === "BOSS") {
    return "ds-quest-roadmap__bar--boss";
  }

  switch (status) {
    case "IN_PROGRESS":
      return "ds-quest-roadmap__bar--progress";
    case "COMPLETED":
      return "ds-quest-roadmap__bar--done";
    case "CANCELLED":
      return "ds-quest-roadmap__bar--cancelled";
    default:
      return "ds-quest-roadmap__bar--todo";
  }
}

export default function QuestRoadmapView({ quests }: QuestRoadmapViewProps) {
  const { t } = useTranslation();
  const { intlLocale } = useAppLocale();
  const [days, setDays] = useState(() => buildRoadmapDays(quests));

  const visibleQuests = useMemo(
    () =>
      quests
        .filter((quest) => quest.status !== "CANCELLED")
        .sort(
          (left, right) =>
            new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
        ),
    [quests],
  );

  const timeline = useMemo(
    () => buildQuestTimelineSpans(visibleQuests, days),
    [visibleQuests, days],
  );
  const monthGroups = useMemo(() => groupDaysByMonth(days), [days]);
  const gridWidth = roadmapWidthPx(days.length);
  const colWidth = dayColumnWidthPx();
  const todayIndex = days.findIndex((day) => day.isToday);

  const questRangeKey = useMemo(
    () =>
      quests
        .map(
          (quest) =>
            `${quest.id}:${quest.createdAt}:${quest.completedAt ?? ""}:${quest.dueDate ?? ""}:${quest.status}`,
        )
        .join("|"),
    [quests],
  );

  useEffect(() => {
    setDays(buildRoadmapDays(quests));
  }, [questRangeKey, quests]);

  function formatMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split("-").map(Number);
    const date = new Date(year!, (month ?? 1) - 1, 1);

    return date.toLocaleDateString(intlLocale, { month: "long", year: "numeric" });
  }

  if (visibleQuests.length === 0) {
    return <p className="ds-empty">{t("questBoard.roadmapEmpty")}</p>;
  }

  return (
    <div className="ds-quest-roadmap">
      <div className="ds-quest-roadmap__toolbar">
        <div className="ds-quest-roadmap__toolbar-group">
          <button
            type="button"
            className="ds-quest-roadmap__tool-btn ds-focus"
            onClick={() => setDays(buildRoadmapDays(quests))}
          >
            {t("questBoard.roadmapToday")}
          </button>
          <button
            type="button"
            className="ds-quest-roadmap__tool-btn ds-focus"
            aria-label={t("questBoard.roadmapPrev")}
            onClick={() => setDays((current) => shiftRoadmapWindow(current, -1))}
          >
            ‹
          </button>
          <button
            type="button"
            className="ds-quest-roadmap__tool-btn ds-focus"
            aria-label={t("questBoard.roadmapNext")}
            onClick={() => setDays((current) => shiftRoadmapWindow(current, 1))}
          >
            ›
          </button>
        </div>
        <p className="ds-quest-roadmap__hint">{t("questBoard.roadmapHint")}</p>
      </div>

      <div className="ds-quest-roadmap__scroll">
        <div className="ds-quest-roadmap__layout">
          <div className="ds-quest-roadmap__sidebar">
            <div className="ds-quest-roadmap__sidebar-head" />
            {timeline.map(({ quest }) => (
              <div key={quest.id} className="ds-quest-roadmap__sidebar-row">
                <span
                  className={`ds-quest-roadmap__status-dot ${roadmapStatusDotClass(quest.status, quest.type)}`}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="ds-quest-roadmap__row-title">{quest.title}</p>
                  {quest.missions.length > 0 && (
                    <p className="ds-quest-roadmap__row-meta">
                      {t("quests.missionsProgress", {
                        completed: completedMissionCount(quest),
                        total: quest.missions.length,
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="ds-quest-roadmap__timeline">
            <div
              className="ds-quest-roadmap__months"
              style={{
                width: gridWidth,
                gridTemplateColumns: `repeat(${days.length}, ${colWidth}px)`,
              }}
            >
              {monthGroups.map((group) => (
                <div
                  key={group.monthKey}
                  className="ds-quest-roadmap__month-label"
                  style={{ gridColumn: `span ${group.days.length}` }}
                >
                  {formatMonthLabel(group.monthKey)}
                </div>
              ))}
            </div>

            <div
              className="ds-quest-roadmap__days"
              style={{
                width: gridWidth,
                gridTemplateColumns: `repeat(${days.length}, ${colWidth}px)`,
              }}
            >
              {days.map((day) => (
                <div
                  key={day.key}
                  className={`ds-quest-roadmap__day ${day.isToday ? "ds-quest-roadmap__day--today" : ""}`}
                >
                  {day.dayNumber}
                </div>
              ))}
            </div>

            <div className="ds-quest-roadmap__grid" style={{ width: gridWidth }}>
              {todayIndex >= 0 && (
                <div
                  className="ds-quest-roadmap__today-line"
                  style={{ left: todayIndex * colWidth + colWidth / 2 }}
                  aria-hidden="true"
                />
              )}

              {timeline.map(({ quest, startOffset, spanDays }) => (
                <div key={quest.id} className="ds-quest-roadmap__grid-row">
                  <div
                    className="ds-quest-roadmap__grid-cells"
                    style={{
                      gridTemplateColumns: `repeat(${days.length}, ${colWidth}px)`,
                    }}
                  >
                    {days.map((day, index) => (
                      <div
                        key={`${quest.id}-${day.key}`}
                        className={`ds-quest-roadmap__cell ${index === startOffset ? "ds-quest-roadmap__cell--start" : ""}`}
                      />
                    ))}
                  </div>
                  <div
                    className={`ds-quest-roadmap__bar ${statusBarClass(quest.status, quest.type)}`}
                    style={{
                      left: startOffset * colWidth + 4,
                      width: Math.max(spanDays * colWidth - 8, colWidth - 8),
                    }}
                    title={quest.title}
                  >
                    <span className="ds-quest-roadmap__bar-label">{quest.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
