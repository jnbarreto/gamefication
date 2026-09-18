export default interface CharacterProgressRepository {
  resetForCharacter(characterId: string): Promise<void>;
}
