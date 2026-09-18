import { getCalendarDay } from "./getCalendarDay.js";

const WEEKDAY_OFFSET_FROM_MONDAY: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export function getCalendarWeekStart(date: Date, timezone: string): string {
  const calendarDay = getCalendarDay(date, timezone);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(date);
  const daysFromMonday = WEEKDAY_OFFSET_FROM_MONDAY[weekday] ?? 0;
  const [year, month, day] = calendarDay.split("-").map(Number);
  const weekStart = new Date(Date.UTC(year, month - 1, day));

  weekStart.setUTCDate(weekStart.getUTCDate() - daysFromMonday);

  const weekYear = weekStart.getUTCFullYear();
  const weekMonth = String(weekStart.getUTCMonth() + 1).padStart(2, "0");
  const weekDay = String(weekStart.getUTCDate()).padStart(2, "0");

  return `${weekYear}-${weekMonth}-${weekDay}`;
}
