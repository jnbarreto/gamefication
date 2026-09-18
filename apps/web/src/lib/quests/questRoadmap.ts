import type { QuestResponse } from "@/lib/api/types";

export type RoadmapDay = {
  key: string;
  date: Date;
  dayNumber: number;
  monthKey: string;
  isToday: boolean;
};

export type QuestTimelineSpan = {
  quest: QuestResponse;
  start: Date;
  end: Date;
  startOffset: number;
  spanDays: number;
};

const DAY_MS = 86_400_000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function dayKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function resolveQuestEndDate(quest: QuestResponse, today = new Date()): Date {
  if (quest.completedAt) {
    return startOfDay(new Date(quest.completedAt));
  }

  if (quest.dueDate) {
    return startOfDay(new Date(quest.dueDate));
  }

  if (quest.status === "IN_PROGRESS") {
    return startOfDay(today);
  }

  return addDays(new Date(quest.createdAt), 7);
}

export function buildRoadmapDays(
  quests: QuestResponse[],
  referenceDate = new Date(),
  paddingDays = 3,
): RoadmapDay[] {
  const today = startOfDay(referenceDate);

  if (quests.length === 0) {
    const start = addDays(today, -paddingDays);
    const end = addDays(today, 14);

    return enumerateDays(start, end, today);
  }

  let rangeStart = startOfDay(new Date(quests[0]!.createdAt));
  let rangeEnd = today;

  for (const quest of quests) {
    const start = startOfDay(new Date(quest.createdAt));
    const end = resolveQuestEndDate(quest, today);

    if (start < rangeStart) {
      rangeStart = start;
    }

    if (end > rangeEnd) {
      rangeEnd = end;
    }
  }

  rangeStart = addDays(rangeStart, -paddingDays);
  rangeEnd = addDays(rangeEnd, paddingDays);

  if (rangeEnd < today) {
    rangeEnd = addDays(today, paddingDays);
  }

  return enumerateDays(rangeStart, rangeEnd, today);
}

function enumerateDays(start: Date, end: Date, today: Date): RoadmapDay[] {
  const days: RoadmapDay[] = [];
  let cursor = start;

  while (cursor <= end) {
    days.push({
      key: dayKey(cursor),
      date: new Date(cursor),
      dayNumber: cursor.getDate(),
      monthKey: monthKey(cursor),
      isToday: dayKey(cursor) === dayKey(today),
    });

    cursor = addDays(cursor, 1);
  }

  return days;
}

export function buildQuestTimelineSpans(
  quests: QuestResponse[],
  days: RoadmapDay[],
  referenceDate = new Date(),
): QuestTimelineSpan[] {
  const dayIndexByKey = new Map(days.map((day, index) => [day.key, index]));
  const today = startOfDay(referenceDate);

  return quests
    .slice()
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    )
    .map((quest) => {
      const start = startOfDay(new Date(quest.createdAt));
      const end = resolveQuestEndDate(quest, today);
      const startKey = dayKey(start);
      const endKey = dayKey(end);

      let startOffset = dayIndexByKey.get(startKey) ?? 0;
      let endOffset = dayIndexByKey.get(endKey) ?? startOffset;

      if (endOffset < startOffset) {
        endOffset = startOffset;
      }

      return {
        quest,
        start,
        end,
        startOffset,
        spanDays: endOffset - startOffset + 1,
      };
    });
}

export function groupDaysByMonth(days: RoadmapDay[]): Array<{ monthKey: string; days: RoadmapDay[] }> {
  const groups: Array<{ monthKey: string; days: RoadmapDay[] }> = [];

  for (const day of days) {
    const last = groups[groups.length - 1];

    if (!last || last.monthKey !== day.monthKey) {
      groups.push({ monthKey: day.monthKey, days: [day] });
      continue;
    }

    last.days.push(day);
  }

  return groups;
}

export function shiftRoadmapWindow(
  days: RoadmapDay[],
  direction: -1 | 1,
): RoadmapDay[] {
  if (days.length === 0) {
    return days;
  }

  const shift = Math.min(14, days.length);
  const start = addDays(days[0]!.date, direction * shift);
  const end = addDays(days[days.length - 1]!.date, direction * shift);
  const today = days.find((day) => day.isToday)?.date ?? new Date();

  return enumerateDays(start, end, today);
}

export function dayColumnWidthPx(): number {
  return 36;
}

export function roadmapWidthPx(dayCount: number): number {
  return dayCount * dayColumnWidthPx();
}

export { startOfDay, addDays, DAY_MS };
