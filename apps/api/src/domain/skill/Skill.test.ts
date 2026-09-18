import { MasteryLevel } from "../enum/MasteryLevel.js";
import InvalidValueError from "../exception/InvalidValueError.js";
import XpAmount from "../shared/XpAmount.js";
import CharacterSkill from "./CharacterSkill.js";
import Skill from "./Skill.js";
import SkillCategory from "./SkillCategory.js";

const categoryId = "550e8400-e29b-41d4-a716-446655440001";
const characterId = "550e8400-e29b-41d4-a716-446655440000";
const skillId = "550e8400-e29b-41d4-a716-446655440002";

describe("SkillCategory", () => {
  it("creates a category with display order", () => {
    const category = SkillCategory.create({
      name: "Backend",
      displayOrder: 1,
    });

    expect(category.getName()).toBe("Backend");
    expect(category.getDisplayOrder()).toBe(1);
  });
});

describe("Skill", () => {
  it("creates a skill with slug and category", () => {
    const skill = Skill.create({
      categoryId,
      name: "Node.js",
      slug: "node-js",
      displayOrder: 1,
    });

    expect(skill.getName()).toBe("Node.js");
    expect(skill.getSlug()).toBe("node-js");
    expect(skill.getCategoryId().toString()).toBe(categoryId);
  });

  it("rejects invalid slugs", () => {
    expect(() =>
      Skill.create({
        categoryId,
        name: "Node.js",
        slug: "Node JS",
        displayOrder: 1,
      }),
    ).toThrow(InvalidValueError);
  });
});

describe("CharacterSkill", () => {
  it("starts with zero XP and unknown mastery", () => {
    const progress = CharacterSkill.create({
      characterId,
      skillId,
    });

    expect(progress.getXp()).toBe(0);
    expect(progress.getMasteryLevel()).toBe(MasteryLevel.UNKNOWN);
    expect(progress.isStale()).toBe(true);
  });

  it("adds XP and auto-updates mastery", () => {
    const progress = CharacterSkill.create({
      characterId,
      skillId,
    });

    progress.addXp(XpAmount.from(75), new Date("2026-09-14T12:00:00.000Z"));

    expect(progress.getXp()).toBe(75);
    expect(progress.getMasteryLevel()).toBe(MasteryLevel.WITH_HELP);
    expect(progress.isStale(new Date("2026-09-14T13:00:00.000Z"))).toBe(false);
  });

  it("supports manual mastery override", () => {
    const progress = CharacterSkill.create({
      characterId,
      skillId,
    });

    progress.addXp(XpAmount.from(10));
    progress.overrideMastery(MasteryLevel.SOLO);

    expect(progress.getMasteryLevel()).toBe(MasteryLevel.SOLO);
    expect(progress.isMasteryOverridden()).toBe(true);

    progress.addXp(XpAmount.from(20));

    expect(progress.getMasteryLevel()).toBe(MasteryLevel.SOLO);

    progress.clearMasteryOverride();

    expect(progress.getMasteryLevel()).toBe(MasteryLevel.SUPERFICIAL);
    expect(progress.isMasteryOverridden()).toBe(false);
  });

  it("rebuilds from persistence", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const updatedAt = new Date("2026-02-01T00:00:00.000Z");
    const lastXpAt = new Date("2026-01-15T00:00:00.000Z");

    const progress = CharacterSkill.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440003",
      characterId,
      skillId,
      xp: 200,
      masteryLevel: MasteryLevel.SOLO,
      masteryOverridden: false,
      lastXpAt,
      createdAt,
      updatedAt,
    });

    expect(progress.getXp()).toBe(200);
    expect(progress.getMasteryLevel()).toBe(MasteryLevel.SOLO);
    expect(progress.getLastXpAt()).toEqual(lastXpAt);
  });
});
