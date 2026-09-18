import InvalidValueError from "../exception/InvalidValueError.js";
import Uuid from "../shared/Uuid.js";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_SKILL_TREE_DEPTH = 8;

export type CreateSkillProps = {
  categoryId: string;
  name: string;
  slug: string;
  displayOrder: number;
  description?: string | null;
  parentSkillId?: string | null;
  isCustom?: boolean;
};

export type RebuildSkillProps = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  displayOrder: number;
  description: string | null;
  parentSkillId: string | null;
  isCustom: boolean;
};

export default class Skill {
  private constructor(
    private readonly id: Uuid,
    private readonly categoryId: Uuid,
    private name: string,
    private slug: string,
    private displayOrder: number,
    private description: string | null,
    private parentSkillId: Uuid | null,
    private isCustom: boolean,
  ) {}

  static create(props: CreateSkillProps): Skill {
    return new Skill(
      Uuid.create(),
      Uuid.from(props.categoryId),
      Skill.requireName(props.name),
      Skill.requireSlug(props.slug),
      Skill.requireDisplayOrder(props.displayOrder),
      Skill.normalizeDescription(props.description),
      props.parentSkillId ? Uuid.from(props.parentSkillId) : null,
      props.isCustom ?? false,
    );
  }

  static rebuild(props: RebuildSkillProps): Skill {
    return new Skill(
      Uuid.from(props.id),
      Uuid.from(props.categoryId),
      props.name,
      props.slug,
      props.displayOrder,
      props.description,
      props.parentSkillId ? Uuid.from(props.parentSkillId) : null,
      props.isCustom,
    );
  }

  getId(): Uuid {
    return this.id;
  }

  getCategoryId(): Uuid {
    return this.categoryId;
  }

  getName(): string {
    return this.name;
  }

  getSlug(): string {
    return this.slug;
  }

  getDisplayOrder(): number {
    return this.displayOrder;
  }

  getDescription(): string | null {
    return this.description;
  }

  getParentSkillId(): Uuid | null {
    return this.parentSkillId;
  }

  isCustomSkill(): boolean {
    return this.isCustom;
  }

  updateDetails(name?: string, description?: string | null): void {
    if (name !== undefined) {
      this.name = Skill.requireName(name);
    }

    if (description !== undefined) {
      this.description = Skill.normalizeDescription(description);
    }
  }

  changeParent(parentSkillId: string | null): void {
    this.parentSkillId = parentSkillId ? Uuid.from(parentSkillId) : null;
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

  private static requireSlug(value: string): string {
    const slug = value.trim().toLowerCase();

    if (!SLUG_PATTERN.test(slug)) {
      throw new InvalidValueError(`slug must be lowercase kebab-case: ${value}`);
    }

    return slug;
  }

  private static requireDisplayOrder(value: number): number {
    if (!Number.isInteger(value) || value < 0) {
      throw new InvalidValueError("displayOrder must be a non-negative integer");
    }

    return value;
  }

  private static normalizeDescription(value?: string | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
      throw new InvalidValueError(
        `description must be at most ${MAX_DESCRIPTION_LENGTH} characters`,
      );
    }

    return trimmed;
  }
}

export function slugifySkillName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
