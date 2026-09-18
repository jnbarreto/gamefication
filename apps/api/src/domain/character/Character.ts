import InvalidValueError from "../exception/InvalidValueError.js";
import XpAmount from "../shared/XpAmount.js";
import Uuid from "../shared/Uuid.js";
import {
  levelFromTotalXp,
  progressToNextLevel,
  xpToNextLevel,
} from "./LevelCalculator.js";

export type CreateCharacterProps = {
  name: string;
  characterClass: string;
  specialization: string;
  subclass?: string;
  careerGoal?: string;
  currentRank?: string;
};

export type RebuildCharacterProps = {
  id: string;
  name: string;
  characterClass: string;
  specialization: string;
  subclass: string | null;
  careerGoal: string | null;
  currentRank: string | null;
  totalXp: number;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateCharacterProfileProps = {
  name?: string;
  characterClass?: string;
  specialization?: string;
  subclass?: string | null;
  careerGoal?: string | null;
  currentRank?: string | null;
};

export default class Character {
  private constructor(
    private readonly id: Uuid,
    private name: string,
    private characterClass: string,
    private specialization: string,
    private subclass: string | null,
    private careerGoal: string | null,
    private currentRank: string | null,
    private totalXp: number,
    private level: number,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(props: CreateCharacterProps): Character {
    const now = new Date();

    return new Character(
      Uuid.create(),
      Character.requireText(props.name, "name"),
      Character.requireText(props.characterClass, "characterClass"),
      Character.requireText(props.specialization, "specialization"),
      props.subclass?.trim() || null,
      props.careerGoal?.trim() || null,
      props.currentRank?.trim() || null,
      0,
      1,
      now,
      now,
    );
  }

  static rebuild(props: RebuildCharacterProps): Character {
    return new Character(
      Uuid.from(props.id),
      props.name,
      props.characterClass,
      props.specialization,
      props.subclass,
      props.careerGoal,
      props.currentRank,
      props.totalXp,
      levelFromTotalXp(props.totalXp),
      props.createdAt,
      props.updatedAt,
    );
  }

  addXp(amount: XpAmount): void {
    this.totalXp += amount.amount;
    this.level = levelFromTotalXp(this.totalXp);
    this.touch();
  }

  updateProfile(props: UpdateCharacterProfileProps): void {
    if (props.name !== undefined) {
      this.name = Character.requireText(props.name, "name");
    }

    if (props.characterClass !== undefined) {
      this.characterClass = Character.requireText(
        props.characterClass,
        "characterClass",
      );
    }

    if (props.specialization !== undefined) {
      this.specialization = Character.requireText(
        props.specialization,
        "specialization",
      );
    }

    if (props.subclass !== undefined) {
      this.subclass = props.subclass?.trim() || null;
    }

    if (props.careerGoal !== undefined) {
      this.careerGoal = props.careerGoal?.trim() || null;
    }

    if (props.currentRank !== undefined) {
      this.currentRank = props.currentRank?.trim() || null;
    }

    this.touch();
  }

  getId(): Uuid {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getCharacterClass(): string {
    return this.characterClass;
  }

  getSpecialization(): string {
    return this.specialization;
  }

  getSubclass(): string | null {
    return this.subclass;
  }

  getCareerGoal(): string | null {
    return this.careerGoal;
  }

  getCurrentRank(): string | null {
    return this.currentRank;
  }

  getTotalXp(): number {
    return this.totalXp;
  }

  getLevel(): number {
    return this.level;
  }

  getXpToNextLevel(): number {
    return xpToNextLevel(this.totalXp, this.level);
  }

  getProgressToNextLevel(): number {
    return progressToNextLevel(this.totalXp, this.level);
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  private static requireText(value: string, field: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new InvalidValueError(`${field} is required`);
    }

    return trimmed;
  }
}
