import type { SkillCategoryResponse } from "@/lib/api/types";
import { useTranslation } from "react-i18next";

type CategoryDetailStripProps = {
  category: SkillCategoryResponse;
  onDelete?: () => void | Promise<void>;
  deleting?: boolean;
};

export default function CategoryDetailStrip({
  category,
  onDelete,
  deleting = false,
}: CategoryDetailStripProps) {
  const { t } = useTranslation();
  const skillCount = category.skills.length;

  return (
    <article className="ds-skill-detail-strip">
      <div className="ds-skill-detail-strip__head">
        <div className="min-w-0">
          <p className="ds-skill-detail-strip__name">{category.name}</p>
          {category.isCustom && (
            <p className="mt-0.5 text-micro text-accent">{t("skills.customCategoryBadge")}</p>
          )}
        </div>
      </div>

      <p className="ds-skill-detail-strip__meta">
        <span>
          {t("skills.categorySkillCount", { count: category.skills.length })}
        </span>
      </p>

      {onDelete && skillCount > 0 && (
        <p className="text-micro text-foreground-muted">{t("skills.deleteCategoryWithSkills")}</p>
      )}

      {onDelete && (
        <button
          type="button"
          className="ds-skill-detail-strip__delete ds-focus"
          onClick={() => void onDelete()}
          disabled={deleting}
        >
          {t("skills.deleteCategory")}
        </button>
      )}
    </article>
  );
}
