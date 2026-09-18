import {
  QuestDifficulty,
  defaultXpForDifficulty,
  parseQuestDifficulty,
} from "../enum/QuestDifficulty.js";
import {
  QuestStatus,
  canTransitionQuestStatus,
  parseQuestStatus,
} from "../enum/QuestStatus.js";
import { QuestType, parseQuestType } from "../enum/QuestType.js";
import DomainError from "../exception/DomainError.js";
import InvalidValueError from "../exception/InvalidValueError.js";
import Uuid from "../shared/Uuid.js";
import QuestSkillAllocation, {
  type CreateQuestSkillAllocationProps,
  type RebuildQuestSkillAllocationProps,
} from "./QuestSkillAllocation.js";

export type CreateQuestProps = {
  characterId: string;
  title: string;
  description?: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  baseXp?: number;
  skillAllocations: CreateQuestSkillAllocationProps[];
  dueDate?: Date;
  notes?: string;
  calendarDay?: string | null;
  calendarWeekStart?: string | null;
};

export type RebuildQuestProps = {
  id: string;
  characterId: string;
  title: string;
  description: string | null;
  type: string;
  difficulty: string;
  baseXp: number;
  status: string;
  skillAllocations: RebuildQuestSkillAllocationProps[];
  dueDate: Date | null;
  completedAt: Date | null;
  notes: string | null;
  calendarDay: string | null;
  calendarWeekStart: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default class Quest {
  private constructor(
    private readonly id: Uuid,
    private readonly characterId: Uuid,
    private title: string,
    private description: string | null,
    private type: QuestType,
    private difficulty: QuestDifficulty,
    private baseXp: number,
    private status: QuestStatus,
    private skillAllocations: QuestSkillAllocation[],
    private dueDate: Date | null,
    private completedAt: Date | null,
    private notes: string | null,
    private calendarDay: string | null,
    private calendarWeekStart: string | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(props: CreateQuestProps): Quest {
    const now = new Date();
    const baseXp = props.baseXp ?? defaultXpForDifficulty(props.difficulty);
    const skillAllocations = Quest.buildSkillAllocations(
      props.skillAllocations,
      baseXp,
    );

    return new Quest(
      Uuid.create(),
      Uuid.from(props.characterId),
      Quest.requireText(props.title, "title"),
      props.description?.trim() || null,
      props.type,
      props.difficulty,
      baseXp,
      QuestStatus.TODO,
      skillAllocations,
      props.dueDate ?? null,
      null,
      props.notes?.trim() || null,
      props.calendarDay ?? null,
      props.calendarWeekStart ?? null,
      now,
      now,
    );
  }

  static rebuild(props: RebuildQuestProps): Quest {
    return new Quest(
      Uuid.from(props.id),
      Uuid.from(props.characterId),
      props.title,
      props.description,
      parseQuestType(props.type),
      parseQuestDifficulty(props.difficulty),
      props.baseXp,
      parseQuestStatus(props.status),
      props.skillAllocations.map((allocation) =>
        QuestSkillAllocation.rebuild(allocation),
      ),
      props.dueDate,
      props.completedAt,
      props.notes,
      props.calendarDay,
      props.calendarWeekStart,
      props.createdAt,
      props.updatedAt,
    );
  }

  start(): void {
    this.transitionTo(QuestStatus.IN_PROGRESS);
  }

  complete(completedAt: Date = new Date()): void {
    this.transitionTo(QuestStatus.COMPLETED);
    this.completedAt = completedAt;
  }

  cancel(): void {
    this.transitionTo(QuestStatus.CANCELLED);
  }

  updateDetails(props: {
    title: string;
    description?: string | null;
    type?: QuestType;
    difficulty?: QuestDifficulty;
    baseXp?: number;
    skillAllocations?: CreateQuestSkillAllocationProps[];
  }): void {
    if (
      this.status !== QuestStatus.TODO &&
      this.status !== QuestStatus.IN_PROGRESS
    ) {
      throw new DomainError("Quest cannot be edited in its current status");
    }

    this.title = Quest.requireText(props.title, "title");

    if (props.description !== undefined) {
      this.description = props.description?.trim() || null;
    }

    if (props.type !== undefined) {
      this.type = props.type;
    }

    if (props.difficulty !== undefined) {
      this.difficulty = props.difficulty;
    }

    if (props.baseXp !== undefined || props.difficulty !== undefined) {
      this.baseXp =
        props.baseXp ?? defaultXpForDifficulty(this.difficulty);
    }

    if (props.skillAllocations !== undefined) {
      this.skillAllocations = Quest.buildSkillAllocations(
        props.skillAllocations,
        this.baseXp,
      );
    }

    this.touch();
  }

  reopen(): void {
    this.transitionTo(QuestStatus.TODO);
    this.completedAt = null;
  }

  resetForNewCalendarDay(calendarDay: string): void {
    if (this.type !== QuestType.DAILY) {
      throw new DomainError("Only daily quests can be reset for a new calendar day");
    }

    this.resetRecurringQuest({
      calendarDay,
      calendarWeekStart: this.calendarWeekStart,
    });
  }

  resetForNewCalendarWeek(calendarWeekStart: string): void {
    if (this.type !== QuestType.WEEKLY) {
      throw new DomainError("Only weekly quests can be reset for a new calendar week");
    }

    this.resetRecurringQuest({
      calendarDay: this.calendarDay,
      calendarWeekStart,
    });
  }

  getId(): Uuid {
    return this.id;
  }

  getCharacterId(): Uuid {
    return this.characterId;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | null {
    return this.description;
  }

  getType(): QuestType {
    return this.type;
  }

  getDifficulty(): QuestDifficulty {
    return this.difficulty;
  }

  getBaseXp(): number {
    return this.baseXp;
  }

  getStatus(): QuestStatus {
    return this.status;
  }

  getSkillAllocations(): QuestSkillAllocation[] {
    return [...this.skillAllocations];
  }

  getDueDate(): Date | null {
    return this.dueDate;
  }

  getCompletedAt(): Date | null {
    return this.completedAt;
  }

  getNotes(): string | null {
    return this.notes;
  }

  getCalendarDay(): string | null {
    return this.calendarDay;
  }

  getCalendarWeekStart(): string | null {
    return this.calendarWeekStart;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  private resetRecurringQuest(period: {
    calendarDay: string | null;
    calendarWeekStart: string | null;
  }): void {
    if (this.status === QuestStatus.CANCELLED) {
      return;
    }

    this.status = QuestStatus.TODO;
    this.completedAt = null;
    this.calendarDay = period.calendarDay;
    this.calendarWeekStart = period.calendarWeekStart;
    this.touch();
  }

  private transitionTo(nextStatus: QuestStatus): void {
    if (!canTransitionQuestStatus(this.status, nextStatus)) {
      throw new DomainError(
        `Cannot transition quest from ${this.status} to ${nextStatus}`,
      );
    }

    this.status = nextStatus;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  private static buildSkillAllocations(
    allocations: CreateQuestSkillAllocationProps[],
    baseXp: number,
  ): QuestSkillAllocation[] {
    if (allocations.length === 0) {
      throw new InvalidValueError("At least one skill allocation is required");
    }

    const skillIds = new Set<string>();
    let totalAllocatedXp = 0;

    const builtAllocations = allocations.map((allocation) => {
      if (skillIds.has(allocation.skillId)) {
        throw new InvalidValueError(
          `Duplicate skill allocation: ${allocation.skillId}`,
        );
      }

      skillIds.add(allocation.skillId);
      const built = QuestSkillAllocation.create(allocation);
      totalAllocatedXp += built.getXp();

      return built;
    });

    if (totalAllocatedXp !== baseXp) {
      throw new InvalidValueError(
        `Skill allocations must sum to ${baseXp}, got ${totalAllocatedXp}`,
      );
    }

    return builtAllocations;
  }

  private static requireText(value: string, field: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new InvalidValueError(`${field} is required`);
    }

    return trimmed;
  }
}
