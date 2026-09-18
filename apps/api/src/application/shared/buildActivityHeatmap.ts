export type ActivityHeatmapLevel = 0 | 1 | 2 | 3 | 4;

export type DailyXpSummary = {
  calendarDay: string;
  totalXp: number;
};

export type ActivityHeatmapCell = {
  day: string;
  xp: number;
  level: ActivityHeatmapLevel;
  isFuture: boolean;
  isPadding?: boolean;
};

export type ActivityHeatmap = {
  days: number;
  cells: ActivityHeatmapCell[];
};

export function addCalendarDays(calendarDay: string, delta: number): string {
  const date = new Date(`${calendarDay}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

function calendarDayOfWeek(calendarDay: string): number {
  return new Date(`${calendarDay}T12:00:00.000Z`).getUTCDay();
}

function daysInMonth(calendarDay: string): number {
  const year = Number.parseInt(calendarDay.slice(0, 4), 10);
  const month = Number.parseInt(calendarDay.slice(5, 7), 10);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function monthStart(calendarDay: string): string {
  return `${calendarDay.slice(0, 7)}-01`;
}

function formatMonthDay(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function levelForXp(xp: number, maxXp: number): ActivityHeatmapLevel {
  if (xp <= 0) {
    return 0;
  }

  if (maxXp <= 0) {
    return 1;
  }

  const ratio = xp / maxXp;

  if (ratio <= 0.25) {
    return 1;
  }

  if (ratio <= 0.5) {
    return 2;
  }

  if (ratio <= 0.75) {
    return 3;
  }

  return 4;
}

export function buildRecentDaysHeatmap(
  summaries: DailyXpSummary[],
  endCalendarDay: string,
  dayCount: number,
): ActivityHeatmap {
  const xpByDay = new Map(
    summaries.map((entry) => [entry.calendarDay, entry.totalXp]),
  );
  const rangeStart = addCalendarDays(endCalendarDay, -(dayCount - 1));
  const rangeXp = summaries
    .filter((entry) => entry.calendarDay >= rangeStart)
    .map((entry) => entry.totalXp);
  const maxXp = rangeXp.reduce(
    (currentMax, totalXp) => Math.max(currentMax, totalXp),
    0,
  );
  const cells: ActivityHeatmapCell[] = [];

  for (let offset = dayCount - 1; offset >= 0; offset -= 1) {
    const day = addCalendarDays(endCalendarDay, -offset);
    const isFuture = day > endCalendarDay;
    const xp = isFuture ? 0 : xpByDay.get(day) ?? 0;

    cells.push({
      day,
      xp,
      level: isFuture ? 0 : levelForXp(xp, maxXp),
      isFuture,
    });
  }

  return { days: dayCount, cells };
}

export function buildMonthHeatmap(
  summaries: DailyXpSummary[],
  referenceCalendarDay: string,
): ActivityHeatmap {
  const year = Number.parseInt(referenceCalendarDay.slice(0, 4), 10);
  const month = Number.parseInt(referenceCalendarDay.slice(5, 7), 10);
  const monthLength = daysInMonth(referenceCalendarDay);
  const firstDay = monthStart(referenceCalendarDay);
  const xpByDay = new Map(
    summaries.map((entry) => [entry.calendarDay, entry.totalXp]),
  );
  const monthPrefix = referenceCalendarDay.slice(0, 7);
  const maxXp = summaries
    .filter((entry) => entry.calendarDay.startsWith(monthPrefix))
    .reduce((currentMax, entry) => Math.max(currentMax, entry.totalXp), 0);
  const cells: ActivityHeatmapCell[] = [];

  for (let index = 0; index < calendarDayOfWeek(firstDay); index += 1) {
    cells.push({
      day: "",
      xp: 0,
      level: 0,
      isFuture: true,
      isPadding: true,
    });
  }

  for (let dayNumber = 1; dayNumber <= monthLength; dayNumber += 1) {
    const day = formatMonthDay(year, month, dayNumber);
    const isFuture = day > referenceCalendarDay;
    const xp = isFuture ? 0 : xpByDay.get(day) ?? 0;

    cells.push({
      day,
      xp,
      level: isFuture ? 0 : levelForXp(xp, maxXp),
      isFuture,
    });
  }

  return { days: monthLength, cells };
}
