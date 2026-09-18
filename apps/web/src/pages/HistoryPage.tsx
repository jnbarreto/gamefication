import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ApiError } from "@/lib/api/client";
import { fetchSkillTree } from "@/lib/api/skills";
import { fetchXpTransactions } from "@/lib/api/xp";
import type { XpTransactionResponse } from "@/lib/api/types";
import { useAppLocale } from "@/lib/i18n/useAppLocale";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-surface-muted bg-surface-muted/40 p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-foreground-muted">{message}</p>;
}

function groupTransactionsByDay(
  transactions: XpTransactionResponse[],
): Array<{ day: string; items: XpTransactionResponse[] }> {
  const groups = new Map<string, XpTransactionResponse[]>();

  for (const transaction of transactions) {
    const dayKey = new Date(transaction.createdAt).toDateString();
    const existing = groups.get(dayKey);

    if (existing) {
      existing.push(transaction);
      continue;
    }

    groups.set(dayKey, [transaction]);
  }

  return [...groups.entries()].map(([day, items]) => ({ day, items }));
}

type SkillFilter = "ALL" | string;

export default function HistoryPage() {
  const { t } = useTranslation();
  const { formatDayHeading, formatTime } = useAppLocale();
  const [transactions, setTransactions] = useState<XpTransactionResponse[]>([]);
  const [skillOptions, setSkillOptions] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [skillFilter, setSkillFilter] = useState<SkillFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSkills() {
      try {
        const tree = await fetchSkillTree();

        if (cancelled) {
          return;
        }

        setSkillOptions(
          tree.categories.flatMap((category) =>
            category.skills.map((skill) => ({
              id: skill.id,
              label: `${category.name} · ${skill.name}`,
            })),
          ),
        );
      } catch {
        if (!cancelled) {
          setSkillOptions([]);
        }
      }
    }

    loadSkills();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchXpTransactions({
          period: "last30days",
          ...(skillFilter === "ALL" ? {} : { skillId: skillFilter }),
        });

        if (cancelled) {
          return;
        }

        setTransactions(result.transactions);
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        if (err instanceof ApiError) {
          setError(err.message);
          return;
        }

        setError(err instanceof Error ? err.message : t("common.unknownError"));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [skillFilter, t]);

  const skillNameById = useMemo(
    () => new Map(skillOptions.map((option) => [option.id, option.label])),
    [skillOptions],
  );

  const groupedTransactions = useMemo(
    () => groupTransactionsByDay(transactions),
    [transactions],
  );

  const totalXp = useMemo(
    () => transactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions],
  );

  if (error) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 p-6 text-sm text-danger">
        {t("errors.loadHistory", { message: error })} {t("common.runDevApi")}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-semibold">{t("history.title")}</h2>
        <p className="mt-2 text-foreground-muted">{t("history.subtitle")}</p>
      </div>

      <Panel title={t("common.summary")}>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-foreground-muted">{t("history.transactions")}</dt>
            <dd className="text-xl font-semibold">{transactions.length}</dd>
          </div>
          <div>
            <dt className="text-foreground-muted">{t("history.totalXp")}</dt>
            <dd className="text-xl font-semibold text-xp">+{totalXp}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-foreground-muted">{t("history.period")}</dt>
            <dd className="text-xl font-semibold">{t("history.last30Days")}</dd>
          </div>
        </dl>
      </Panel>

      <Panel title={t("common.filters")}>
        <label className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-foreground-muted">{t("common.skill")}</span>
          <select
            className="rounded-lg border border-surface-muted bg-surface px-3 py-2"
            value={skillFilter}
            onChange={(event) => setSkillFilter(event.target.value)}
          >
            <option value="ALL">{t("history.allSkills")}</option>
            {skillOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </Panel>

      <Panel title={t("history.timeline")}>
        {loading ? (
          <p className="text-sm text-foreground-muted">{t("history.loading")}</p>
        ) : transactions.length === 0 ? (
          <EmptyState message={t("history.noTransactions")} />
        ) : (
          <div className="space-y-8">
            {groupedTransactions.map(({ day, items }) => (
              <section key={day}>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">
                  {formatDayHeading(items[0]!.createdAt)}
                </h4>
                <ul className="mt-4 space-y-3 border-l border-surface-muted pl-4">
                  {items.map((transaction) => (
                    <li
                      key={transaction.id}
                      className="relative rounded-lg border border-surface-muted bg-surface/60 p-4 before:absolute before:-left-[1.0625rem] before:top-5 before:h-2 before:w-2 before:rounded-full before:bg-accent"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="mt-1 text-xs text-foreground-muted">
                            {transaction.sourceType}
                            {transaction.skillId
                              ? ` · ${skillNameById.get(transaction.skillId) ?? t("common.skill")}`
                              : ""}
                            {" · "}
                            {formatTime(transaction.createdAt)}
                          </p>
                        </div>
                        <span className="font-mono font-semibold text-xp">
                          +{transaction.amount}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
