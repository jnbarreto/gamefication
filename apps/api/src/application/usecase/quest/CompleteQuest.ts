import { QuestStatus } from "../../../domain/enum/QuestStatus.js";
import ApplicationError from "../../exception/ApplicationError.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type Character from "../../../domain/character/Character.js";
import type Quest from "../../../domain/quest/Quest.js";
import type Streak from "../../../domain/streak/Streak.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type CharacterSkillRepository from "../../repository/CharacterSkillRepository.js";
import type QuestCompletionRepository from "../../repository/QuestCompletionRepository.js";
import type { QuestCompletionEvidence } from "../../repository/QuestCompletionRepository.js";
import type QuestMissionRepository from "../../repository/QuestMissionRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";
import type StreakRepository from "../../repository/StreakRepository.js";
import XpAmount from "../../../domain/shared/XpAmount.js";
import XpTransaction from "../../../domain/xp/XpTransaction.js";
import { getCalendarDay } from "../../shared/getCalendarDay.js";

export type CompleteQuestInput = {
  evidence?: QuestCompletionEvidence;
};

export type CompleteQuestResult = {
  quest: Quest;
  character: Character;
  streak: Streak;
  xpTransactions: XpTransaction[];
  evidence: QuestCompletionEvidence | null;
};

export default class CompleteQuest {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly questRepository: QuestRepository,
    private readonly characterSkillRepository: CharacterSkillRepository,
    private readonly streakRepository: StreakRepository,
    private readonly questCompletionRepository: QuestCompletionRepository,
    private readonly missionRepository: QuestMissionRepository,
    private readonly timezone: string,
  ) {}

  async execute(
    userId: string,
    questId: string,
    input: CompleteQuestInput = {},
  ): Promise<CompleteQuestResult> {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    const quest = await this.questRepository.findById(questId);

    if (!quest || quest.getCharacterId().toString() !== character.getId().toString()) {
      throw new NotFoundError("Quest not found");
    }

    if (quest.getStatus() !== QuestStatus.IN_PROGRESS) {
      throw new ApplicationError("Quest must be in progress to complete");
    }

    const missions = await this.missionRepository.findByQuestId(questId);

    if (
      missions.length > 0 &&
      missions.some((mission) => !mission.isMissionCompleted())
    ) {
      throw new ApplicationError("All missions must be completed before finishing the quest");
    }

    const streak = await this.streakRepository.findByCharacterId(
      character.getId().toString(),
    );

    if (!streak) {
      throw new NotFoundError("Streak not found");
    }

    const skillIds = quest
      .getSkillAllocations()
      .map((allocation) => allocation.getSkillId().toString());
    const characterSkills =
      await this.characterSkillRepository.findByCharacterAndSkillIds(
        character.getId().toString(),
        skillIds,
      );
    const characterSkillBySkillId = new Map(
      characterSkills.map((skill) => [skill.getSkillId().toString(), skill]),
    );

    for (const skillId of skillIds) {
      if (!characterSkillBySkillId.has(skillId)) {
        throw new ApplicationError(`Skill progress not found: ${skillId}`);
      }
    }

    const completedAt = new Date();
    quest.complete(completedAt);
    character.addXp(XpAmount.from(quest.getBaseXp()));

    const xpTransactions: XpTransaction[] = [];

    for (const allocation of quest.getSkillAllocations()) {
      const skillId = allocation.getSkillId().toString();
      const characterSkill = characterSkillBySkillId.get(skillId)!;

      characterSkill.addXp(XpAmount.from(allocation.getXp()), completedAt);
      xpTransactions.push(
        XpTransaction.createFromQuest({
          characterId: character.getId().toString(),
          questId: quest.getId().toString(),
          amount: allocation.getXp(),
          skillId,
          description: `Quest completed: ${quest.getTitle()}`,
        }),
      );
    }

    const calendarDay = getCalendarDay(completedAt, this.timezone);
    const streakResult = streak.recordActivity(calendarDay);

    for (const bonus of streakResult.bonuses) {
      character.addXp(XpAmount.from(bonus.xp));
      xpTransactions.push(
        XpTransaction.createFromStreakBonus({
          characterId: character.getId().toString(),
          amount: bonus.xp,
          description: `Streak bonus: ${bonus.milestoneDays} days`,
          sourceId: streak.getId().toString(),
        }),
      );
    }

    await this.questCompletionRepository.persist({
      quest,
      character,
      characterSkills,
      streak,
      xpTransactions,
      evidence: input.evidence ?? null,
    });

    return {
      quest,
      character,
      streak,
      xpTransactions,
      evidence: input.evidence ?? null,
    };
  }
}
