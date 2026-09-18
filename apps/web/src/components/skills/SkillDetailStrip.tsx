import ProgressBar from "@/components/dashboard/ProgressBar";
import type { SkillProgressResponse } from "@/lib/api/types";
import {
  progressToNextMasteryLevel,
  xpToNextMasteryLevel,
} from "@/lib/constants/mastery";
import { useAppLocale } from "@/lib/i18n/useAppLocale";
import { useTranslation } from "react-i18next";

type SkillDetailStripProps = {
  skill: SkillProgressResponse;
  onShowDescription?: () => void;
  onDelete?: () => void | Promise<void>;
  deleting?: boolean;
};

export default function SkillDetailStrip({
  skill,
  onShowDescription,
  onDelete,
  deleting = false,
}: SkillDetailStripProps) {
  const { t } = useTranslation();
  const { formatDate } = useAppLocale();
  const progress = progressToNextMasteryLevel(skill.xp, skill.masteryLevel);
  const xpRemaining = xpToNextMasteryLevel(skill.xp, skill.masteryLevel);
  const masteryLabel = t(`enums.mastery.${skill.masteryLevel}`, {
    defaultValue: skill.masteryLevel,
  });
  const lastXpLabel = formatDate(skill.lastXpAt) ?? t("common.never");
  const progressHint =
    xpRemaining === null
      ? t("skills.maxMastery")
      : t("skills.xpToNextLevel", { xp: xpRemaining });

  return (
    <article className="ds-skill-detail-strip">
      <div className="ds-skill-detail-strip__head">
        <div className="min-w-0">
          <p className="ds-skill-detail-strip__name">{skill.name}</p>
          {skill.isCustom && (
            <p className="mt-0.5 text-micro text-accent">{t("skills.customBadge")}</p>
          )}
        </div>
        <div className="flex shrink-0 items-start gap-2">
          {skill.description && onShowDescription && (
            <button
              type="button"
              className="ds-skill-detail-strip__info ds-focus"
              onClick={onShowDescription}
              aria-label={t("skills.viewDescription")}
            >
              i
            </button>
          )}
          <p className="ds-skill-detail-strip__xp">
            {skill.xp} {t("common.xp")}
          </p>
        </div>
      </div>

      <p className="ds-skill-detail-strip__meta">
        <span>{masteryLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{lastXpLabel}</span>
        {skill.isStale && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-warning">{t("skills.stale")}</span>
          </>
        )}
        {skill.masteryOverridden && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-accent">{t("skills.manual")}</span>
          </>
        )}
      </p>

      <ProgressBar value={progress} label={progressHint} compact />

      {onDelete && (
        <button
          type="button"
          className="ds-skill-detail-strip__delete ds-focus"
          onClick={() => void onDelete()}
          disabled={deleting}
        >
          {t("skills.deleteSkill")}
        </button>
      )}
    </article>
  );
}
