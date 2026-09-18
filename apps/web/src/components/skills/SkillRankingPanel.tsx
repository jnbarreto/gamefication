import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { SkillCategoryResponse, SkillProgressResponse } from "@/lib/api/types";

type RankedSkill = SkillProgressResponse & {
  categoryName: string;
  rank: number;
};

type ListedSkill = SkillProgressResponse & {
  categoryName: string;
};

type SkillRankingPanelProps = {
  categories: SkillCategoryResponse[];
  selectedSlug: string | null;
  onSelect: (skill: SkillProgressResponse) => void;
};

function RankingRow({
  skill,
  rankLabel,
  selectedSlug,
  onSelect,
  muted = false,
}: {
  skill: ListedSkill;
  rankLabel: string;
  selectedSlug: string | null;
  onSelect: (skill: SkillProgressResponse) => void;
  muted?: boolean;
}) {
  const isSelected = skill.slug === selectedSlug;

  return (
    <li>
      <button
        type="button"
        className={`ds-skill-ranking__row ds-focus ${isSelected ? "ds-skill-ranking__row--selected" : ""} ${muted ? "ds-skill-ranking__row--muted" : ""}`}
        onClick={() => onSelect(skill)}
        aria-pressed={isSelected}
      >
        <span className="ds-skill-ranking__rank">{rankLabel}</span>
        <span className="ds-skill-ranking__name">{skill.name}</span>
        <span className="ds-skill-ranking__category">{skill.categoryName}</span>
        <span className={`ds-skill-ranking__xp ${muted ? "text-foreground-muted" : ""}`}>
          {skill.xp > 0 ? skill.xp : "—"}
        </span>
      </button>
    </li>
  );
}

export default function SkillRankingPanel({
  categories,
  selectedSlug,
  onSelect,
}: SkillRankingPanelProps) {
  const { t } = useTranslation();

  const { rankedWithXp, availableSkills } = useMemo(() => {
    const entries = categories.flatMap((category) =>
      category.skills.map((skill) => ({
        ...skill,
        categoryName: category.name,
      })),
    );

    const withXp = entries
      .filter((skill) => skill.xp > 0)
      .sort((left, right) => {
        if (right.xp !== left.xp) {
          return right.xp - left.xp;
        }

        return left.name.localeCompare(right.name);
      })
      .map((skill, index) => ({
        ...skill,
        rank: index + 1,
      })) satisfies RankedSkill[];

    const withoutXp = entries
      .filter((skill) => skill.xp === 0)
      .sort((left, right) => left.name.localeCompare(right.name)) satisfies ListedSkill[];

    return { rankedWithXp: withXp, availableSkills: withoutXp };
  }, [categories]);

  if (rankedWithXp.length === 0 && availableSkills.length === 0) {
    return <p className="ds-empty">{t("skills.noSkills")}</p>;
  }

  return (
    <div className="ds-skill-ranking ds-scroll-area ds-scroll-area--sidebar">
      {rankedWithXp.length > 0 && (
        <ol className="ds-skill-ranking__list">
          {rankedWithXp.map((skill) => (
            <RankingRow
              key={skill.id}
              skill={skill}
              rankLabel={`${skill.rank}`}
              selectedSlug={selectedSlug}
              onSelect={onSelect}
            />
          ))}
        </ol>
      )}

      {availableSkills.length > 0 && (
        <>
          {rankedWithXp.length > 0 && <div className="ds-skill-ranking__divider" />}
          <ol className="ds-skill-ranking__list">
            {availableSkills.map((skill) => (
              <RankingRow
                key={skill.id}
                skill={skill}
                rankLabel="·"
                selectedSlug={selectedSlug}
                onSelect={onSelect}
                muted
              />
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
