import InvalidValueError from "../exception/InvalidValueError.js";
import Uuid from "../shared/Uuid.js";

const MAX_NAME_LENGTH = 100;

export type CreateSkillCategoryProps = {
  name: string;
  displayOrder: number;
  isCustom?: boolean;
};

export type RebuildSkillCategoryProps = {
  id: string;
  name: string;
  displayOrder: number;
  isCustom?: boolean;
};

export default class SkillCategory {
  private constructor(
    private readonly id: Uuid,
    private name: string,
    private displayOrder: number,
    private isCustom: boolean,
  ) {}

  static create(props: CreateSkillCategoryProps): SkillCategory {
    return new SkillCategory(
      Uuid.create(),
      SkillCategory.requireName(props.name),
      SkillCategory.requireDisplayOrder(props.displayOrder),
      props.isCustom ?? false,
    );
  }

  static rebuild(props: RebuildSkillCategoryProps): SkillCategory {
    return new SkillCategory(
      Uuid.from(props.id),
      props.name,
      props.displayOrder,
      props.isCustom ?? false,
    );
  }

  getId(): Uuid {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDisplayOrder(): number {
    return this.displayOrder;
  }

  isCustomCategory(): boolean {
    return this.isCustom;
  }

  private static requireName(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new InvalidValueError("name is required");
    }

    if (trimmed.length > MAX_NAME_LENGTH) {
      throw new InvalidValueError(`name must be at most ${MAX_NAME_LENGTH} characters`);
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
