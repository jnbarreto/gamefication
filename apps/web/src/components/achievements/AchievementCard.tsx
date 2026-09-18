import { useTranslation } from "react-i18next";

import type { AchievementResponse } from "@/lib/api/types";
import { useAppLocale } from "@/lib/i18n/useAppLocale";

type AchievementCardProps = {
  achievement: AchievementResponse;
  unlocking: boolean;
  isExpanded: boolean;
  evidenceUrl: string;
  onToggleUnlock: () => void;
  onEvidenceChange: (value: string) => void;
  onConfirmUnlock: () => void;
  actionError: string | null;
};

export default function AchievementCard({
  achievement,
  unlocking,
  isExpanded,
  evidenceUrl,
  onToggleUnlock,
  onEvidenceChange,
  onConfirmUnlock,
  actionError,
}: AchievementCardProps) {
  const { t } = useTranslation();
  const { formatDateTime } = useAppLocale();

  return (
    <article
      className={
        achievement.unlocked
          ? "rounded-lg border border-success/30 bg-success/10 p-4"
          : "rounded-lg border border-surface-muted bg-surface/60 p-4"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{achievement.name}</p>
          <p className="mt-1 text-sm text-foreground-muted">
            {achievement.description}
          </p>
        </div>

        <span
          className={
            achievement.unlocked
              ? "rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success"
              : "rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-foreground-muted"
          }
        >
          {achievement.unlocked ? t("achievements.unlocked") : t("achievements.locked")}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-foreground-muted">{t("achievements.category")}</dt>
          <dd className="font-semibold">{achievement.category}</dd>
        </div>
        <div>
          <dt className="text-foreground-muted">{t("achievements.reward")}</dt>
          <dd className="font-semibold text-xp">
            +{achievement.rewardXp} {t("common.xp")}
          </dd>
        </div>
      </dl>

      {achievement.unlocked && achievement.unlockedAt && (
        <p className="mt-4 text-xs text-foreground-muted">
          {t("achievements.unlockedAt", {
            date: formatDateTime(achievement.unlockedAt),
          })}
        </p>
      )}

      {!achievement.unlocked && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onToggleUnlock}
            className="ds-btn-primary"
          >
            {t("achievements.unlock")}
          </button>

          {isExpanded && (
            <div className="mt-4 grid gap-3 border-t border-surface-muted pt-4">
              <label className="grid gap-2 text-sm">
                <span className="text-foreground-muted">
                  {t("common.evidenceUrlOptional")}
                </span>
                <input
                  className="rounded-lg border border-surface-muted bg-surface px-3 py-2"
                  value={evidenceUrl}
                  onChange={(event) => onEvidenceChange(event.target.value)}
                  placeholder={t("common.evidencePlaceholder")}
                />
              </label>

              {actionError && <p className="text-sm text-danger">{actionError}</p>}

              <button
                type="button"
                disabled={unlocking}
                onClick={onConfirmUnlock}
                className="ds-btn-success inline-flex w-fit disabled:opacity-50"
              >
                {unlocking ? t("common.unlocking") : t("common.confirmUnlock")}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
