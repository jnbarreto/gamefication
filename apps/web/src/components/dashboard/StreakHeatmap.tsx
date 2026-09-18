import { useTranslation } from "react-i18next";

import type { ActivityHeatmapResponse } from "@/lib/api/types";
import { useAppLocale } from "@/lib/i18n/useAppLocale";

type StreakHeatmapProps = {
  heatmap: ActivityHeatmapResponse;
  activeDay?: string | null;
};

function dayOfMonth(calendarDay: string): number {
  return Number.parseInt(calendarDay.slice(8, 10), 10);
}

export default function StreakHeatmap({ heatmap, activeDay }: StreakHeatmapProps) {
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
            <span className="ds-streak-month-heatmap__date">{dayOfMonth(cell.day)}</span>
            <span
              className={`ds-streak-month-heatmap__pill ds-streak-month-heatmap__pill--level-${
                cell.day === activeDay ? 4 : cell.level
              }${
                cell.isFuture && cell.day !== activeDay ? " ds-streak-month-heatmap__pill--future" : ""
              } ${cell.day === activeDay ? "!bg-accent" : ""}`}
              title={title}
            />
          </div>
        );
      })}
    </div>
  );
}
