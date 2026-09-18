import { TEST_USER_ID } from '../../../test/testAuth.js';
import { EvidenceType } from "../../../domain/enum/EvidenceType.js";
import { XpSourceType } from "../../../domain/enum/XpSourceType.js";
import Achievement from "../../../domain/achievement/Achievement.js";
import AchievementUnlock from "../../../domain/achievement/AchievementUnlock.js";
import Character from "../../../domain/character/Character.js";
import ApplicationError from "../../exception/ApplicationError.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type AchievementRepository from "../../repository/AchievementRepository.js";
import type { AchievementListEntry } from "../../repository/AchievementRepository.js";
import type AchievementUnlockRepository from "../../repository/AchievementUnlockRepository.js";
import type { AchievementUnlockSnapshot } from "../../repository/AchievementUnlockRepository.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import ListAchievements from "./ListAchievements.js";
import UnlockAchievement from "./UnlockAchievement.js";

class InMemoryCharacterRepository implements CharacterRepository {
  constructor(private character: Character | null) {}

  async findByUserId(_userId: string) {
    return this.character;
  }

  async save() {}
}

class InMemoryAchievementRepository implements AchievementRepository {
  constructor(
    private entries: AchievementListEntry[],
    private unlocks: AchievementUnlock[] = [],
  ) {}

  async findAllWithUnlocks(_characterId: string) {
    return this.entries;
  }

  async findBySlug(slug: string) {
    const entry = this.entries.find((item) => item.achievement.getSlug() === slug);

    return entry?.achievement ?? null;
  }

  async findUnlockByCharacterAndAchievementId(
    characterId: string,
    achievementId: string,
  ) {
    return (
      this.unlocks.find(
        (unlock) =>
          unlock.getCharacterId().toString() === characterId &&
          unlock.getAchievementId().toString() === achievementId,
      ) ?? null
    );
  }

  addUnlock(unlock: AchievementUnlock) {
    this.unlocks.push(unlock);
  }
}

class InMemoryAchievementUnlockRepository implements AchievementUnlockRepository {
  snapshots: AchievementUnlockSnapshot[] = [];

  async persist(snapshot: AchievementUnlockSnapshot) {
    this.snapshots.push(snapshot);
  }
}

const achievement = Achievement.rebuild({
  id: "550e8400-e29b-41d4-a716-446655440010",
  slug: "first-pr",
  name: "First Pull Request",
  description: "Open your first pull request with evidence.",
  category: "Backend",
  rewardXp: 25,
  conditionType: "MANUAL",
});

describe("ListAchievements", () => {
  it("returns achievements with unlock status", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const unlock = AchievementUnlock.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440011",
      characterId: character.getId().toString(),
      achievementId: achievement.getId().toString(),
      unlockedAt: new Date("2026-09-14T12:00:00.000Z"),
      evidenceId: null,
    });
    const useCase = new ListAchievements(
      new InMemoryCharacterRepository(character),
      new InMemoryAchievementRepository([
        { achievement, unlock },
        {
          achievement: Achievement.rebuild({
            id: "550e8400-e29b-41d4-a716-446655440012",
            slug: "first-deploy",
            name: "First Deploy",
            description: "Deploy an application.",
            category: "DevOps",
            rewardXp: 50,
            conditionType: "MANUAL",
          }),
          unlock: null,
        },
      ]),
    );

    const result = await useCase.execute(TEST_USER_ID);

    expect(result).toHaveLength(2);
    expect(result[0]?.unlock).not.toBeNull();
    expect(result[1]?.unlock).toBeNull();
  });

  it("throws when no character exists", async () => {
    const useCase = new ListAchievements(
      new InMemoryCharacterRepository(null),
      new InMemoryAchievementRepository([]),
    );

    await expect(useCase.execute(TEST_USER_ID)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("UnlockAchievement", () => {
  it("unlocks an achievement, grants XP, and persists snapshot", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const achievementRepository = new InMemoryAchievementRepository([
      { achievement, unlock: null },
    ]);
    const unlockRepository = new InMemoryAchievementUnlockRepository();
    const useCase = new UnlockAchievement(
      new InMemoryCharacterRepository(character),
      achievementRepository,
      unlockRepository,
    );

    const result = await useCase.execute(TEST_USER_ID, "first-pr", {
      evidence: {
        type: EvidenceType.URL,
        value: "https://github.com/org/repo/pull/1",
        description: "Merged PR",
      },
    });

    expect(result.achievement.getSlug()).toBe("first-pr");
    expect(result.character.getTotalXp()).toBe(25);
    expect(result.xpTransaction?.getSourceType()).toBe(XpSourceType.ACHIEVEMENT);
    expect(unlockRepository.snapshots).toHaveLength(1);
    expect(unlockRepository.snapshots[0]?.evidence?.value).toBe(
      "https://github.com/org/repo/pull/1",
    );
  });

  it("rejects duplicate unlock", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const existingUnlock = AchievementUnlock.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440011",
      characterId: character.getId().toString(),
      achievementId: achievement.getId().toString(),
      unlockedAt: new Date("2026-09-14T12:00:00.000Z"),
      evidenceId: null,
    });
    const achievementRepository = new InMemoryAchievementRepository(
      [{ achievement, unlock: existingUnlock }],
      [existingUnlock],
    );
    const useCase = new UnlockAchievement(
      new InMemoryCharacterRepository(character),
      achievementRepository,
      new InMemoryAchievementUnlockRepository(),
    );

    await expect(useCase.execute(TEST_USER_ID, "first-pr")).rejects.toBeInstanceOf(ApplicationError);
  });

  it("throws when achievement is not found", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const useCase = new UnlockAchievement(
      new InMemoryCharacterRepository(character),
      new InMemoryAchievementRepository([]),
      new InMemoryAchievementUnlockRepository(),
    );

    await expect(useCase.execute(TEST_USER_ID, "missing-slug")).rejects.toBeInstanceOf(NotFoundError);
  });
});
