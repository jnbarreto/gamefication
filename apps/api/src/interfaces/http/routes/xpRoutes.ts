import type { Express } from "express";

import { presentXpTransactionList } from "../../../application/presenter/XpTransactionPresenter.js";
import ListXpTransactions from "../../../application/usecase/xp/ListXpTransactions.js";
import PostgresCharacterRepository from "../../../infrastructure/repository/PostgresCharacterRepository.js";
import PostgresXpTransactionRepository from "../../../infrastructure/repository/PostgresXpTransactionRepository.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { parseListXpTransactionsQuery } from "../validation/parseListXpTransactionsQuery.js";

const characterRepository = new PostgresCharacterRepository();
const xpTransactionRepository = new PostgresXpTransactionRepository();
const listXpTransactions = new ListXpTransactions(
  characterRepository,
  xpTransactionRepository,
);

export function registerXpRoutes(app: Express): void {
  app.get(
    "/api/v1/xp/transactions",
    asyncHandler(async (req, res) => {
      const filter = parseListXpTransactionsQuery(req.query as Record<string, unknown>);
      const transactions = await listXpTransactions.execute(requireAuth(req).userId, filter);

      res.json(presentXpTransactionList(transactions));
    }),
  );
}
