import CharacterSkill from "../../domain/skill/CharacterSkill.js";
import Skill from "../../domain/skill/Skill.js";
import SkillCategory from "../../domain/skill/SkillCategory.js";
import type { SkillTreeEntry } from "../repository/SkillRepository.js";
import { presentSkillTree, presentStaleSkills } from "./SkillPresenter.js";

function buildEntry(
  categoryName: string,
  skillName: string,
  lastXpAt: Date | null,
): SkillTreeEntry {
  const category = SkillCategory.rebuild({
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: categoryName,
    displayOrder: 0,
  });
  const skill = Skill.rebuild({
    id: "550e8400-e29b-41d4-a716-446655440011",
    categoryId: category.getId().toString(),
    name: skillName,
    slug: "node-js",
    displayOrder: 0,
    description: null,
    parentSkillId: null,
    isCustom: false,
  });
  const progress = CharacterSkill.rebuild({
    id: "550e8400-e29b-41d4-a716-446655440012",
    characterId: "550e8400-e29b-41d4-a716-446655440000",
    skillId: skill.getId().toString(),
    xp: 10,
    masteryLevel: "UNKNOWN",
    masteryOverridden: false,
    lastXpAt,
    createdAt: new Date("2026-09-01T00:00:00.000Z"),
    updatedAt: new Date("2026-09-01T00:00:00.000Z"),
  });

  return { category, skill, progress };
}

describe("SkillPresenter", () => {
  const referenceDate = new Date("2026-09-14T00:00:00.000Z");

  it("groups skills by category", () => {
    const backendCategory = SkillCategory.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440020",
      name: "Backend",
      displayOrder: 0,
    });
    const devopsCategory = SkillCategory.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440021",
      name: "DevOps",
      displayOrder: 1,
    });

    const entries: SkillTreeEntry[] = [
      {
        category: backendCategory,
        skill: Skill.rebuild({
          id: "550e8400-e29b-41d4-a716-446655440030",
          categoryId: backendCategory.getId().toString(),
          name: "Node.js",
          slug: "node-js",
          displayOrder: 0,
          description: null,
          parentSkillId: null,
          isCustom: false,
        }),
        progress: CharacterSkill.rebuild({
          id: "550e8400-e29b-41d4-a716-446655440040",
          characterId: "550e8400-e29b-41d4-a716-446655440000",
          skillId: "550e8400-e29b-41d4-a716-446655440030",
          xp: 0,
          masteryLevel: "UNKNOWN",
          masteryOverridden: false,
          lastXpAt: null,
          createdAt: new Date("2026-09-01T00:00:00.000Z"),
          updatedAt: new Date("2026-09-01T00:00:00.000Z"),
        }),
      },
      {
        category: devopsCategory,
        skill: Skill.rebuild({
          id: "550e8400-e29b-41d4-a716-446655440031",
          categoryId: devopsCategory.getId().toString(),
          name: "Docker",
          slug: "docker",
          displayOrder: 0,
          description: "Containers",
          parentSkillId: null,
          isCustom: true,
        }),
        progress: CharacterSkill.rebuild({
          id: "550e8400-e29b-41d4-a716-446655440041",
          characterId: "550e8400-e29b-41d4-a716-446655440000",
          skillId: "550e8400-e29b-41d4-a716-446655440031",
          xp: 25,
          masteryLevel: "SUPERFICIAL",
          masteryOverridden: false,
          lastXpAt: new Date("2026-09-13T00:00:00.000Z"),
          createdAt: new Date("2026-09-01T00:00:00.000Z"),
          updatedAt: new Date("2026-09-13T00:00:00.000Z"),
        }),
      },
    ];

    expect(presentSkillTree(entries, referenceDate, [backendCategory, devopsCategory])).toEqual({
      categories: [
        {
          id: backendCategory.getId().toString(),
          name: "Backend",
          displayOrder: 0,
          isCustom: false,
          skills: [
            expect.objectContaining({
              name: "Node.js",
              isStale: true,
            }),
          ],
        },
        {
          id: devopsCategory.getId().toString(),
          name: "DevOps",
          displayOrder: 1,
          isCustom: false,
          skills: [
            expect.objectContaining({
              name: "Docker",
              isStale: false,
            }),
          ],
        },
      ],
    });
  });

  it("lists custom categories before seeded ones", () => {
    const backendCategory = SkillCategory.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440020",
      name: "Backend",
      displayOrder: 0,
      isCustom: false,
    });
    const frontendCategory = SkillCategory.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440022",
      name: "Frontend",
      displayOrder: 10,
      isCustom: true,
    });

    expect(
      presentSkillTree([], referenceDate, [backendCategory, frontendCategory]).categories.map(
        (category) => category.name,
      ),
    ).toEqual(["Frontend", "Backend"]);
  });

  it("returns only stale skills with category metadata", () => {
    const fresh = buildEntry(
      "Backend",
      "TypeScript",
      new Date("2026-09-13T00:00:00.000Z"),
    );
    const stale = buildEntry("Backend", "Node.js", null);

    expect(presentStaleSkills([fresh, stale], referenceDate)).toEqual({
      skills: [
        expect.objectContaining({
          name: "Node.js",
          categoryName: "Backend",
          isStale: true,
        }),
      ],
    });
  });
});
