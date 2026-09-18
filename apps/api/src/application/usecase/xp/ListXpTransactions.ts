import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type { ListXpTransactionsFilter } from "../../repository/XpTransactionRepository.js";
import type XpTransactionRepository from "../../repository/XpTransactionRepository.js";

export default class ListXpTransactions {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly xpTransactionRepository: XpTransactionRepository,
  ) {}

  async execute(userId: string, filter: ListXpTransactionsFilter = {}) {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    return this.xpTransactionRepository.findByCharacterId(
      character.getId().toString(),
      filter,
    );
  }
}
