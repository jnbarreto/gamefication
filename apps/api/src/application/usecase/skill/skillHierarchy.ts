import type SkillRepository from "../../repository/SkillRepository.js";
import { MAX_SKILL_TREE_DEPTH, slugifySkillName } from "../../../domain/skill/Skill.js";
import ValidationError from "../../../shared/exception/ValidationError.js";

export async function generateUniqueSkillSlug(
  name: string,
  slugExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugifySkillName(name) || "skill";
  let candidate = base;
  let suffix = 2;

  while (await slugExists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function resolveCategoryIdForParent(
  skillRepository: SkillRepository,
  categoryId: string | undefined,
  parentSkillId: string | null | undefined,
): Promise<string> {
  if (parentSkillId) {
    const parent = await skillRepository.findById(parentSkillId);

    if (!parent) {
      throw new ValidationError("parentSkillId not found");
    }

    if (categoryId && categoryId !== parent.category.getId().toString()) {
      throw new ValidationError("categoryId must match parent category");
    }

    return parent.category.getId().toString();
  }

  if (!categoryId) {
    throw new ValidationError("categoryId is required when parentSkillId is omitted");
  }

  return categoryId;
}

export async function assertValidParentPlacement(
  skillRepository: SkillRepository,
  parentSkillId: string | null,
  categoryId: string,
): Promise<void> {
  if (parentSkillId === null) {
    return;
  }

  const parent = await skillRepository.findById(parentSkillId);

  if (!parent) {
    throw new ValidationError("parentSkillId not found");
  }

  if (parent.category.getId().toString() !== categoryId) {
    throw new ValidationError("Parent skill must belong to the same category");
  }

  const parentDepth = await skillRepository.maxDepthFromRoot(parentSkillId);

  if (parentDepth + 1 > MAX_SKILL_TREE_DEPTH) {
    throw new ValidationError(`Skill tree depth cannot exceed ${MAX_SKILL_TREE_DEPTH} levels`);
  }
}

export async function assertValidParentMove(
  skillRepository: SkillRepository,
  skillId: string,
  parentSkillId: string | null,
  categoryId: string,
): Promise<void> {
  if (parentSkillId === null) {
    await assertDepthWithinLimit(skillRepository, 0, skillId);
    return;
  }

  if (parentSkillId === skillId) {
    throw new ValidationError("A skill cannot be its own parent");
  }

  const parent = await skillRepository.findById(parentSkillId);

  if (!parent) {
    throw new ValidationError("parentSkillId not found");
  }

  if (parent.category.getId().toString() !== categoryId) {
    throw new ValidationError("Parent skill must belong to the same category");
  }

  if (await skillRepository.wouldCreateCycle(skillId, parentSkillId)) {
    throw new ValidationError("Move would create a cycle in the skill tree");
  }

  const parentDepth = await skillRepository.maxDepthFromRoot(parentSkillId);
  await assertDepthWithinLimit(skillRepository, parentDepth, skillId);
}

async function assertDepthWithinLimit(
  skillRepository: SkillRepository,
  parentDepth: number,
  skillId: string,
): Promise<void> {
  const subtreeHeight = await skillRepository.maxDepthBelow(skillId);

  if (parentDepth + subtreeHeight > MAX_SKILL_TREE_DEPTH) {
    throw new ValidationError(`Skill tree depth cannot exceed ${MAX_SKILL_TREE_DEPTH} levels`);
  }
}
