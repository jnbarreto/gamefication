import { MasteryLevel, parseMasteryLevel } from "../enum/MasteryLevel.js";
import XpAmount from "../shared/XpAmount.js";
import Uuid from "../shared/Uuid.js";
import { calculateMasteryLevel } from "./MasteryCalculator.js";

export type CreateCharacterSkillProps = {
  characterId: string;
  skillId: string;
};

export type RebuildCharacterSkillProps = {
  id: string;
  characterId: string;
  skillId: string;
  xp: number;
  masteryLevel: string;
  masteryOverridden: boolean;
  lastXpAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const STALE_SKILL_DAYS = 12;

export default class CharacterSkill {
  private constructor(
    private readonly id: Uuid,
    private readonly characterId: Uuid,
    private readonly skillId: Uuid,
    private xp: number,
    private masteryLevel: MasteryLevel,
    private masteryOverridden: boolean,
    private lastXpAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(props: CreateCharacterSkillProps): CharacterSkill {
    const now = new Date();

    return new CharacterSkill(
      Uuid.create(),
      Uuid.from(props.characterId),
      Uuid.from(props.skillId),
      0,
      MasteryLevel.UNKNOWN,
      false,
      null,
      now,
      now,
    );
  }

  static rebuild(props: RebuildCharacterSkillProps): CharacterSkill {
    return new CharacterSkill(
      Uuid.from(props.id),
      Uuid.from(props.characterId),
      Uuid.from(props.skillId),
      props.xp,
      parseMasteryLevel(props.masteryLevel),
      props.masteryOverridden,
      props.lastXpAt,
      props.createdAt,
      props.updatedAt,
    );
  }

  addXp(amount: XpAmount, earnedAt: Date = new Date()): void {
    this.xp += amount.amount;
    this.lastXpAt = earnedAt;

    if (!this.masteryOverridden) {
      this.masteryLevel = calculateMasteryLevel(this.xp);
    }

    this.touch();
  }

  overrideMastery(level: MasteryLevel): void {
    this.masteryLevel = level;
    this.masteryOverridden = true;
    this.touch();
  }

  clearMasteryOverride(): void {
    this.masteryOverridden = false;
    this.masteryLevel = calculateMasteryLevel(this.xp);
    this.touch();
  }

  isStale(referenceDate: Date = new Date()): boolean {
    if (!this.lastXpAt) {
      return true;
    }

    const elapsedMs = referenceDate.getTime() - this.lastXpAt.getTime();
    const thresholdMs = STALE_SKILL_DAYS * 24 * 60 * 60 * 1000;

    return elapsedMs >= thresholdMs;
  }

  getId(): Uuid {
    return this.id;
  }

  getCharacterId(): Uuid {
    return this.characterId;
  }

  getSkillId(): Uuid {
    return this.skillId;
  }

  getXp(): number {
    return this.xp;
  }

  getMasteryLevel(): MasteryLevel {
    return this.masteryLevel;
  }

  isMasteryOverridden(): boolean {
    return this.masteryOverridden;
  }

  getLastXpAt(): Date | null {
    return this.lastXpAt;
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
}
