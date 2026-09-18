export const STREAK_MILESTONES = {
  3: 10,
  7: 30,
  14: 75,
  30: 200,
} as const;

export type StreakMilestone = keyof typeof STREAK_MILESTONES;

export function xpBonusForMilestone(milestoneDays: StreakMilestone): number {
  return STREAK_MILESTONES[milestoneDays];
}

export function isStreakMilestone(days: number): days is StreakMilestone {
  return days in STREAK_MILESTONES;
}

export function previousCalendarDay(calendarDay: string): string {
  const date = new Date(`${calendarDay}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);

  return date.toISOString().slice(0, 10);
}
