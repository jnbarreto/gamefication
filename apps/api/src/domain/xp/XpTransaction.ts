import { XpSourceType, parseXpSourceType } from "../enum/XpSourceType.js";
import InvalidValueError from "../exception/InvalidValueError.js";
import XpAmount from "../shared/XpAmount.js";
import Uuid from "../shared/Uuid.js";

export type RebuildXpTransactionProps = {
  id: string;
  characterId: string;
  amount: number;
  sourceType: string;
  sourceId: string | null;
  skillId: string | null;
  description: string;
  createdAt: Date;
};

type CreateXpTransactionProps = {
  characterId: string;
  amount: number;
  sourceType: XpSourceType;
  sourceId: string | null;
  skillId: string | null;
  description: string;
};

export default class XpTransaction {
  private constructor(
    private readonly id: Uuid,
    private readonly characterId: Uuid,
    private readonly amount: XpAmount,
    private readonly sourceType: XpSourceType,
    private readonly sourceId: Uuid | null,
    private readonly skillId: Uuid | null,
    private readonly description: string,
    private readonly createdAt: Date,
  ) {}

  static createFromQuest(props: {
    characterId: string;
    questId: string;
    amount: number;
    skillId?: string | null;
    description: string;
  }): XpTransaction {
    return XpTransaction.create({
      characterId: props.characterId,
      amount: props.amount,
      sourceType: XpSourceType.QUEST,
      sourceId: props.questId,
      skillId: props.skillId ?? null,
      description: props.description,
    });
  }

  static createFromStreakBonus(props: {
    characterId: string;
    amount: number;
    description: string;
    sourceId?: string | null;
  }): XpTransaction {
    return XpTransaction.create({
      characterId: props.characterId,
      amount: props.amount,
      sourceType: XpSourceType.STREAK_BONUS,
      sourceId: props.sourceId ?? null,
      skillId: null,
      description: props.description,
    });
  }

  static createFromAchievement(props: {
    characterId: string;
    achievementUnlockId: string;
    amount: number;
    description: string;
    skillId?: string | null;
  }): XpTransaction {
    return XpTransaction.create({
      characterId: props.characterId,
      amount: props.amount,
      sourceType: XpSourceType.ACHIEVEMENT,
      sourceId: props.achievementUnlockId,
      skillId: props.skillId ?? null,
      description: props.description,
    });
  }

  static createManual(props: {
    characterId: string;
    amount: number;
    description: string;
    skillId?: string | null;
    sourceId?: string | null;
  }): XpTransaction {
    return XpTransaction.create({
      characterId: props.characterId,
      amount: props.amount,
      sourceType: XpSourceType.MANUAL,
      sourceId: props.sourceId ?? null,
      skillId: props.skillId ?? null,
      description: props.description,
    });
  }

  static rebuild(props: RebuildXpTransactionProps): XpTransaction {
    return new XpTransaction(
      Uuid.from(props.id),
      Uuid.from(props.characterId),
      XpAmount.from(props.amount),
      parseXpSourceType(props.sourceType),
      props.sourceId ? Uuid.from(props.sourceId) : null,
      props.skillId ? Uuid.from(props.skillId) : null,
      props.description,
      props.createdAt,
    );
  }

  getId(): Uuid {
    return this.id;
  }

  getCharacterId(): Uuid {
    return this.characterId;
  }

  getAmount(): XpAmount {
    return this.amount;
  }

  getSourceType(): XpSourceType {
    return this.sourceType;
  }

  getSourceId(): Uuid | null {
    return this.sourceId;
  }

  getSkillId(): Uuid | null {
    return this.skillId;
  }

  getDescription(): string {
    return this.description;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  isCharacterLevel(): boolean {
    return this.skillId === null;
  }

  private static create(props: CreateXpTransactionProps): XpTransaction {
    XpTransaction.validateSource(props.sourceType, props.sourceId);
    XpTransaction.validateDescription(props.description);

    return new XpTransaction(
      Uuid.create(),
      Uuid.from(props.characterId),
      XpAmount.from(props.amount),
      props.sourceType,
      props.sourceId ? Uuid.from(props.sourceId) : null,
      props.skillId ? Uuid.from(props.skillId) : null,
      props.description.trim(),
      new Date(),
    );
  }

  private static validateSource(
    sourceType: XpSourceType,
    sourceId: string | null,
  ): void {
    if (
      (sourceType === XpSourceType.QUEST || sourceType === XpSourceType.ACHIEVEMENT) &&
      !sourceId
    ) {
      throw new InvalidValueError(`${sourceType} transactions require sourceId`);
    }
  }

  private static validateDescription(description: string): void {
    if (!description.trim()) {
      throw new InvalidValueError("description is required");
    }
  }
}
