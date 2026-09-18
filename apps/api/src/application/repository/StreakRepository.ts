import type Streak from "../../domain/streak/Streak.js";

export default interface StreakRepository {
  findByCharacterId(characterId: string): Promise<Streak | null>;
}
