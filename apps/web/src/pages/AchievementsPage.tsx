import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import AchievementCard from "@/components/achievements/AchievementCard";
import { ApiError } from "@/lib/api/client";
import { fetchAchievements, unlockAchievement } from "@/lib/api/achievements";
import type { AchievementResponse } from "@/lib/api/types";

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

type StatusFilter = "ALL" | "LOCKED" | "UNLOCKED";

export default function AchievementsPage() {
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState<AchievementResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [unlockingSlug, setUnlockingSlug] = useState<string | null>(null);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const loadAchievements = useCallback(async () => {
    const result = await fetchAchievements();
    setAchievements(result.achievements);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        await loadAchievements();
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

    load();

    return () => {
      cancelled = true;
    };
  }, [loadAchievements, t]);

  const filteredAchievements = useMemo(() => {
    return achievements.filter((achievement) => {
      if (statusFilter === "LOCKED") {
        return !achievement.unlocked;
      }

      if (statusFilter === "UNLOCKED") {
        return achievement.unlocked;
      }

      return true;
    });
  }, [achievements, statusFilter]);

  const groupedByCategory = useMemo(() => {
    const groups = new Map<string, AchievementResponse[]>();

    for (const achievement of filteredAchievements) {
      const existing = groups.get(achievement.category);

      if (existing) {
        existing.push(achievement);
        continue;
      }

      groups.set(achievement.category, [achievement]);
    }

    return [...groups.entries()].map(([category, items]) => ({
      category,
      items,
    }));
  }, [filteredAchievements]);

  const unlockedCount = useMemo(
    () => achievements.filter((achievement) => achievement.unlocked).length,
    [achievements],
  );

  async function handleUnlock(slug: string) {
    setActionError(null);
    setUnlockingSlug(slug);

    try {
      await unlockAchievement(
        slug,
        evidenceUrl.trim()
          ? {
              type: "URL",
              value: evidenceUrl.trim(),
            }
          : undefined,
      );

      setExpandedSlug(null);
      setEvidenceUrl("");
      await loadAchievements();
    } catch (err: unknown) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("errors.unlockAchievement"),
      );
    } finally {
      setUnlockingSlug(null);
    }
  }

  if (error) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 p-6 text-sm text-danger">
        {t("errors.loadAchievements", { message: error })} {t("common.runDevApi")}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-semibold">{t("achievements.title")}</h2>
        <p className="mt-2 text-foreground-muted">
          {t("achievements.subtitle", {
            unlocked: unlockedCount,
            total: achievements.length,
          })}
        </p>
      </div>

      <Panel title={t("common.summary")}>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-foreground-muted">{t("common.total")}</dt>
            <dd className="text-xl font-semibold">{achievements.length}</dd>
          </div>
          <div>
            <dt className="text-foreground-muted">{t("achievements.unlocked")}</dt>
            <dd className="text-xl font-semibold text-success">{unlockedCount}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-foreground-muted">{t("achievements.locked")}</dt>
            <dd className="text-xl font-semibold">
              {achievements.length - unlockedCount}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel title={t("common.filters")}>
        <label className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-foreground-muted">{t("common.status")}</span>
          <select
            className="rounded-lg border border-surface-muted bg-surface px-3 py-2"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="ALL">{t("common.all")}</option>
            <option value="LOCKED">{t("achievements.filterLocked")}</option>
            <option value="UNLOCKED">{t("achievements.filterUnlocked")}</option>
          </select>
        </label>
      </Panel>

      {loading ? (
        <p className="text-sm text-foreground-muted">{t("achievements.loading")}</p>
      ) : filteredAchievements.length === 0 ? (
        <Panel title={t("achievements.title")}>
          <EmptyState message={t("achievements.noMatch")} />
        </Panel>
      ) : (
        groupedByCategory.map(({ category, items }) => (
          <Panel key={category} title={category}>
            <ul className="grid gap-4 lg:grid-cols-2">
              {items.map((achievement) => (
                <li key={achievement.id}>
                  <AchievementCard
                    achievement={achievement}
                    unlocking={unlockingSlug === achievement.slug}
                    isExpanded={expandedSlug === achievement.slug}
                    evidenceUrl={expandedSlug === achievement.slug ? evidenceUrl : ""}
                    onToggleUnlock={() => {
                      setActionError(null);
                      setExpandedSlug((current) =>
                        current === achievement.slug ? null : achievement.slug,
                      );
                      setEvidenceUrl("");
                    }}
                    onEvidenceChange={setEvidenceUrl}
                    onConfirmUnlock={() => handleUnlock(achievement.slug)}
                    actionError={expandedSlug === achievement.slug ? actionError : null}
                  />
                </li>
              ))}
            </ul>
          </Panel>
        ))
      )}
    </div>
  );
}
