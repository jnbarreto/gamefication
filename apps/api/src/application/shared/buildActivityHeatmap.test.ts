import {
  addCalendarDays,
  buildMonthHeatmap,
  buildRecentDaysHeatmap,
  levelForXp,
} from "./buildActivityHeatmap.js";

describe("buildRecentDaysHeatmap", () => {
  it("maps XP totals into intensity levels for the last seven days", () => {
    const heatmap = buildRecentDaysHeatmap(
      [
        { calendarDay: "2026-09-10", totalXp: 10 },
        { calendarDay: "2026-09-12", totalXp: 40 },
        { calendarDay: "2026-09-14", totalXp: 20 },
      ],
      "2026-09-14",
      7,
    );

    expect(heatmap.days).toBe(7);
    expect(heatmap.cells).toHaveLength(7);
    expect(heatmap.cells[0]?.day).toBe("2026-09-08");
    expect(heatmap.cells[6]?.day).toBe("2026-09-14");
  });
});

describe("buildMonthHeatmap", () => {
  it("builds a calendar grid for the current month with day-of-month cells", () => {
    const heatmap = buildMonthHeatmap(
      [
        { calendarDay: "2026-09-01", totalXp: 5 },
        { calendarDay: "2026-09-10", totalXp: 40 },
        { calendarDay: "2026-09-14", totalXp: 20 },
      ],
      "2026-09-15",
    );

    expect(heatmap.days).toBe(30);
    expect(heatmap.cells[0]?.isPadding).toBe(true);
    expect(heatmap.cells.find((cell) => cell.day === "2026-09-01")?.level).toBe(1);
    expect(heatmap.cells.find((cell) => cell.day === "2026-09-10")?.level).toBe(4);
    expect(heatmap.cells.find((cell) => cell.day === "2026-09-15")?.isFuture).toBe(
      false,
    );
    expect(heatmap.cells.find((cell) => cell.day === "2026-09-16")?.isFuture).toBe(
      true,
    );
  });

  it("levels XP using quartiles of the period maximum", () => {
    expect(levelForXp(0, 100)).toBe(0);
    expect(levelForXp(10, 100)).toBe(1);
    expect(levelForXp(40, 100)).toBe(2);
    expect(levelForXp(70, 100)).toBe(3);
    expect(levelForXp(100, 100)).toBe(4);
  });

  it("adds calendar days in UTC", () => {
    expect(addCalendarDays("2026-09-14", 1)).toBe("2026-09-15");
    expect(addCalendarDays("2026-09-01", -1)).toBe("2026-08-31");
  });
});
