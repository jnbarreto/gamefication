import Uuid from "../shared/Uuid.js";

export type CreateAchievementUnlockProps = {
  characterId: string;
  achievementId: string;
};

export type RebuildAchievementUnlockProps = {
  id: string;
  characterId: string;
  achievementId: string;
  unlockedAt: Date;
  evidenceId: string | null;
};

export default class AchievementUnlock {
  private constructor(
    private readonly id: Uuid,
    private readonly characterId: Uuid,
    private readonly achievementId: Uuid,
    private readonly unlockedAt: Date,
    private readonly evidenceId: Uuid | null,
  ) {}

  static create(props: CreateAchievementUnlockProps): AchievementUnlock {
    return new AchievementUnlock(
      Uuid.create(),
      Uuid.from(props.characterId),
      Uuid.from(props.achievementId),
      new Date(),
      null,
    );
  }

  static rebuild(props: RebuildAchievementUnlockProps): AchievementUnlock {
    return new AchievementUnlock(
      Uuid.from(props.id),
      Uuid.from(props.characterId),
      Uuid.from(props.achievementId),
      props.unlockedAt,
      props.evidenceId ? Uuid.from(props.evidenceId) : null,
    );
  }

  getId(): Uuid {
    return this.id;
  }

  getCharacterId(): Uuid {
    return this.characterId;
  }

  getAchievementId(): Uuid {
    return this.achievementId;
  }

  getUnlockedAt(): Date {
    return this.unlockedAt;
  }

  getEvidenceId(): Uuid | null {
    return this.evidenceId;
  }
}
