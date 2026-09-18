import XpAmount from "../shared/XpAmount.js";
import Uuid from "../shared/Uuid.js";

export type CreateQuestSkillAllocationProps = {
  skillId: string;
  xp: number;
};

export type RebuildQuestSkillAllocationProps = {
  skillId: string;
  xp: number;
};

export default class QuestSkillAllocation {
  private constructor(
    private readonly skillId: Uuid,
    private readonly xp: number,
  ) {}

  static create(props: CreateQuestSkillAllocationProps): QuestSkillAllocation {
    return new QuestSkillAllocation(
      Uuid.from(props.skillId),
      XpAmount.from(props.xp).amount,
    );
  }

  static rebuild(props: RebuildQuestSkillAllocationProps): QuestSkillAllocation {
    return new QuestSkillAllocation(Uuid.from(props.skillId), props.xp);
  }

  getSkillId(): Uuid {
    return this.skillId;
  }

  getXp(): number {
    return this.xp;
  }
}
