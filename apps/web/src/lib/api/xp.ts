import { apiGet } from "./client";
import type { XpTransactionListResponse } from "./types";

export type ListXpTransactionsParams = {
  period?: "last30days";
  skillId?: string;
};

function buildTransactionsPath(params?: ListXpTransactionsParams): string {
  const search = new URLSearchParams();

  if (params?.period) {
    search.set("period", params.period);
  }

  if (params?.skillId) {
    search.set("skillId", params.skillId);
  }

  const query = search.toString();

  return query ? `/xp/transactions?${query}` : "/xp/transactions";
}

export function fetchXpTransactions(
  params?: ListXpTransactionsParams,
): Promise<XpTransactionListResponse> {
  return apiGet<XpTransactionListResponse>(buildTransactionsPath(params));
}
