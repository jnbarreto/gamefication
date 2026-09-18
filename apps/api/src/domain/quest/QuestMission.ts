import InvalidValueError from "../exception/InvalidValueError.js";
import Uuid from "../shared/Uuid.js";

const MAX_TITLE_LENGTH = 255;

export type CreateQuestMissionProps = {
  questId: string;
  title: string;
  displayOrder: number;
};

export type RebuildQuestMissionProps = {
  id: string;
  questId: string;
  title: string;
  displayOrder: number;
  isCompleted: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export default class QuestMission {
  private constructor(
    private readonly id: Uuid,
    private readonly questId: Uuid,
    private title: string,
    private displayOrder: number,
    private isCompleted: boolean,
    private completedAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(props: CreateQuestMissionProps): QuestMission {
    const now = new Date();

    return new QuestMission(
      Uuid.create(),
      Uuid.from(props.questId),
      QuestMission.requireTitle(props.title),
      QuestMission.requireDisplayOrder(props.displayOrder),
      false,
      null,
      now,
      now,
    );
  }

  static rebuild(props: RebuildQuestMissionProps): QuestMission {
    return new QuestMission(
      Uuid.from(props.id),
      Uuid.from(props.questId),
      props.title,
      props.displayOrder,
      props.isCompleted,
      props.completedAt,
      props.createdAt,
      props.updatedAt,
    );
  }

  getId(): Uuid {
    return this.id;
  }

  getQuestId(): Uuid {
    return this.questId;
  }

  getTitle(): string {
    return this.title;
  }

  getDisplayOrder(): number {
    return this.displayOrder;
  }

  isMissionCompleted(): boolean {
    return this.isCompleted;
  }

  getCompletedAt(): Date | null {
    return this.completedAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  setCompleted(completed: boolean, completedAt: Date = new Date()): void {
    this.isCompleted = completed;
    this.completedAt = completed ? completedAt : null;
    this.touch();
  }

  updateTitle(title: string): void {
    this.title = QuestMission.requireTitle(title);
    this.touch();
  }

  setDisplayOrder(displayOrder: number): void {
    this.displayOrder = QuestMission.requireDisplayOrder(displayOrder);
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  private static requireTitle(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new InvalidValueError("mission title is required");
    }

    if (trimmed.length > MAX_TITLE_LENGTH) {
      throw new InvalidValueError(`mission title must be at most ${MAX_TITLE_LENGTH} characters`);
    }

    return trimmed;
  }

  private static requireDisplayOrder(value: number): number {
    if (!Number.isInteger(value) || value < 0) {
      throw new InvalidValueError("displayOrder must be a non-negative integer");
    }

    return value;
  }
}
