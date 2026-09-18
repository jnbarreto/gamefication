import InvalidValueError from "../exception/InvalidValueError.js";
import Uuid from "../shared/Uuid.js";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type RebuildAchievementProps = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  rewardXp: number;
  conditionType: string;
};

export default class Achievement {
  private constructor(
    private readonly id: Uuid,
    private readonly slug: string,
    private readonly name: string,
    private readonly description: string,
    private readonly category: string,
    private readonly rewardXp: number,
    private readonly conditionType: string,
  ) {}

  static rebuild(props: RebuildAchievementProps): Achievement {
    return new Achievement(
      Uuid.from(props.id),
      Achievement.requireSlug(props.slug),
      Achievement.requireText(props.name, "name"),
      Achievement.requireText(props.description, "description"),
      Achievement.requireText(props.category, "category"),
      Achievement.requireRewardXp(props.rewardXp),
      Achievement.requireText(props.conditionType, "conditionType"),
    );
  }

  getId(): Uuid {
    return this.id;
  }

  getSlug(): string {
    return this.slug;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getCategory(): string {
    return this.category;
  }

  getRewardXp(): number {
    return this.rewardXp;
  }

  getConditionType(): string {
    return this.conditionType;
  }

  private static requireText(value: string, field: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new InvalidValueError(`${field} is required`);
    }

    return trimmed;
  }

  private static requireSlug(value: string): string {
    const trimmed = value.trim();

    if (!SLUG_PATTERN.test(trimmed)) {
      throw new InvalidValueError(`Invalid achievement slug: ${value}`);
    }

    return trimmed;
  }

  private static requireRewardXp(value: number): number {
    if (!Number.isInteger(value) || value < 0) {
      throw new InvalidValueError(
        `rewardXp must be a non-negative integer, got ${value}`,
      );
    }

    return value;
  }
}
