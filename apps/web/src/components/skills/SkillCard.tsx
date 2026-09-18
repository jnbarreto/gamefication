import ProgressBar from "@/components/dashboard/ProgressBar";
import type { SkillProgressResponse } from "@/lib/api/types";
import {
  progressToNextMasteryLevel,
  xpToNextMasteryLevel,
} from "@/lib/constants/mastery";
import { useAppLocale } from "@/lib/i18n/useAppLocale";
import { useTranslation } from "react-i18next";

type SkillCardProps = {
  skill: SkillProgressResponse;
  compact?: boolean;
};

export default function SkillCard({ skill, compact = false }: SkillCardProps) {
  const { t } = useTranslation();
  const { formatDate } = useAppLocale();
  const progress = progressToNextMasteryLevel(skill.xp, skill.masteryLevel);
  const xpRemaining = xpToNextMasteryLevel(skill.xp, skill.masteryLevel);
  const progressLabel =
    xpRemaining === null
      ? t("skills.maxMastery")
      : t("skills.xpToNextLevel", { xp: xpRemaining });

  if (compact) {
    return (
      <article className="rounded-panel border border-border/20 bg-surface/60 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {skill.isStale && (
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-micro font-medium text-warning">
                {t("skills.stale")}
              </span>
            )}
            {skill.masteryOverridden && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-micro font-medium text-accent">
                {t("skills.manual")}
              </span>
            )}
          </div>
          <p className="font-mono text-small font-semibold text-xp">
            {skill.xp} {t("common.xp")}
          </p>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-3 text-micro">
          <div>
            <dt className="text-foreground-muted">{t("skills.mastery")}</dt>
            <dd className="font-semibold">
              {t(`enums.mastery.${skill.masteryLevel}`, {
                defaultValue: skill.masteryLevel,
              })}
            </dd>
          </div>
          <div>
            <dt className="text-foreground-muted">{t("skills.lastXp")}</dt>
            <dd className="font-semibold">
              {formatDate(skill.lastXpAt) ?? t("common.never")}
            </dd>
          </div>
        </dl>

        <div className="mt-3">
          <ProgressBar value={progress} label={progressLabel} />
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-surface-muted bg-surface/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{skill.name}</p>
          <p className="mt-1 text-xs text-foreground-muted">{skill.slug}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {skill.isStale && (
            <span className="rounded-full bg-warning/15 px-2 py-1 text-xs font-medium text-warning">
              {t("skills.stale")}
            </span>
          )}
          {skill.masteryOverridden && (
            <span className="rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent">
              {t("skills.manual")}
            </span>
          )}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="text-foreground-muted">{t("common.xp")}</dt>
          <dd className="font-semibold">{skill.xp}</dd>
        </div>
        <div>
          <dt className="text-foreground-muted">{t("skills.mastery")}</dt>
          <dd className="font-semibold">
            {t(`enums.mastery.${skill.masteryLevel}`, {
              defaultValue: skill.masteryLevel,
            })}
          </dd>
        </div>
        <div>
          <dt className="text-foreground-muted">{t("skills.lastXp")}</dt>
          <dd className="font-semibold">
            {formatDate(skill.lastXpAt) ?? t("common.never")}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <ProgressBar value={progress} label={progressLabel} />
      </div>
    </article>
  );
}
