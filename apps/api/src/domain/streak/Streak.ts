import InvalidValueError from "../exception/InvalidValueError.js";
import Uuid from "../shared/Uuid.js";
import {
  isStreakMilestone,
  previousCalendarDay,
  xpBonusForMilestone,
} from "./StreakMilestones.js";

export type CreateStreakProps = {
  characterId: string;
};

export type RebuildStreakProps = {
  id: string;
  characterId: string;
  currentCount: number;
  bestCount: number;
  lastActivityDay: string | null;
  bonusesClaimed: number[];
  createdAt: Date;
  updatedAt: Date;
};

export type StreakBonusAward = {
  milestoneDays: number;
  xp: number;
};

export type StreakActivityResult = {
  incremented: boolean;
  reset: boolean;
  currentCount: number;
  bonuses: StreakBonusAward[];
};

export default class Streak {
  private constructor(
    private readonly id: Uuid,
    private readonly characterId: Uuid,
    private currentCount: number,
    private bestCount: number,
    private lastActivityDay: string | null,
    private bonusesClaimed: number[],
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(props: CreateStreakProps): Streak {
    const now = new Date();

    return new Streak(
      Uuid.create(),
      Uuid.from(props.characterId),
      0,
      0,
      null,
      [],
      now,
      now,
    );
  }

  static rebuild(props: RebuildStreakProps): Streak {
    return new Streak(
      Uuid.from(props.id),
      Uuid.from(props.characterId),
      props.currentCount,
      props.bestCount,
      props.lastActivityDay,
      [...props.bonusesClaimed],
      props.createdAt,
      props.updatedAt,
    );
  }

  recordActivity(calendarDay: string): StreakActivityResult {
    Streak.validateCalendarDay(calendarDay);

    if (this.lastActivityDay === calendarDay) {
      return {
        incremented: false,
        reset: false,
        currentCount: this.currentCount,
        bonuses: [],
      };
    }

    let reset = false;

    if (this.lastActivityDay === null) {
      this.currentCount = 1;
    } else if (this.lastActivityDay === previousCalendarDay(calendarDay)) {
      this.currentCount += 1;
    } else {
      this.currentCount = 1;
      this.bonusesClaimed = [];
      reset = true;
    }

    this.lastActivityDay = calendarDay;
    this.bestCount = Math.max(this.bestCount, this.currentCount);
    this.touch();

    const bonuses = this.claimEligibleBonuses();

    return {
      incremented: true,
      reset,
      currentCount: this.currentCount,
      bonuses,
    };
  }

  getId(): Uuid {
    return this.id;
  }

  getCharacterId(): Uuid {
    return this.characterId;
  }

  getCurrentCount(): number {
    return this.currentCount;
  }

  getBestCount(): number {
    return this.bestCount;
  }

  getLastActivityDay(): string | null {
    return this.lastActivityDay;
  }

  getBonusesClaimed(): number[] {
    return [...this.bonusesClaimed];
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  private claimEligibleBonuses(): StreakBonusAward[] {
    if (!isStreakMilestone(this.currentCount)) {
      return [];
    }

    if (this.bonusesClaimed.includes(this.currentCount)) {
      return [];
    }

    this.bonusesClaimed.push(this.currentCount);

    return [
      {
        milestoneDays: this.currentCount,
        xp: xpBonusForMilestone(this.currentCount),
      },
    ];
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  private static validateCalendarDay(calendarDay: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(calendarDay)) {
      throw new InvalidValueError(`Invalid calendar day: ${calendarDay}`);
    }
  }
}
