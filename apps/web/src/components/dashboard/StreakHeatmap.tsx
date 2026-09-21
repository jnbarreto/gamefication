import { useTranslation } from "react-i18next";

import type { ActivityHeatmapCellResponse, ActivityHeatmapResponse } from "@/lib/api/types";
import { useAppLocale } from "@/lib/i18n/useAppLocale";

type StreakHeatmapProps = {
  heatmap: ActivityHeatmapResponse;
  activeDay?: string | null;
  todayDay?: string | null;
};

function dayOfMonth(calendarDay: string): number {
  return Number.parseInt(calendarDay.slice(8, 10), 10);
}

function getPillClass(cell: ActivityHeatmapCellResponse, activeDay?: string | null): string {
  if (cell.isPadding) {
    return "";
  }

  const isActive = Boolean(activeDay && cell.day === activeDay);

  // Every day that had progress (XP > 0, level > 0, or active day) retains its green mark
  if (cell.xp > 0 || cell.level > 0 || isActive) {
    const level = isActive ? Math.max(cell.level, 4) : cell.level;
    switch (level) {
      case 1:
        return "bg-accent/40 border-accent/40";
      case 2:
        return "bg-accent/60 border-accent/50";
      case 3:
        return "bg-accent/80 border-accent/60";
      case 4:
      default:
        return "bg-accent border-accent shadow-sm shadow-accent/50";
    }
  }

  if (cell.isFuture) {
    return "bg-transparent border-border/10 opacity-30";
  }

  // Inactive past day
  return "bg-surface-muted/60 border-border/15";
}

export default function StreakHeatmap({
  heatmap,
  activeDay,
  todayDay,
}: StreakHeatmapProps) {
  const { t } = useTranslation();
  const { formatDate } = useAppLocale();

  return (
    <div
      className="ds-streak-month-heatmap"
      role="img"
      aria-label={t("dashboard.heatmapAria")}
    >
      {heatmap.cells.map((cell, index) => {
        if (cell.isPadding) {
          return (
            <div
              key={`padding-${index}`}
              className="ds-streak-month-heatmap__column ds-streak-month-heatmap__column--padding"
              aria-hidden="true"
            />
          );
        }

        const isToday = Boolean(todayDay && cell.day === todayDay);
        const title = cell.isFuture
          ? t("dashboard.heatmapFutureDay", { day: formatDate(cell.day) })
          : cell.xp > 0
            ? t("dashboard.heatmapActiveDay", {
                day: formatDate(cell.day),
                xp: cell.xp,
              })
            : t("dashboard.heatmapInactiveDay", { day: formatDate(cell.day) });

        return (
          <div key={cell.day} className="ds-streak-month-heatmap__column">
            <span
              className={`ds-streak-month-heatmap__date ${
                isToday ? "font-bold text-accent" : ""
              }`}
            >
              {dayOfMonth(cell.day)}
            </span>
            <span
              className={`ds-streak-month-heatmap__pill border ${getPillClass(cell, activeDay)}`}
              title={title}
            />
          </div>
        );
      })}
    </div>
  );
}
