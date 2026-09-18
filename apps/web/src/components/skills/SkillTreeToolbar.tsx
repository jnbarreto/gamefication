import { useTranslation } from "react-i18next";

import type { SkillProgressResponse } from "@/lib/api/types";

export type SkillTreeInteractionMode = "normal" | "move";

type SkillTreeToolbarProps = {
  interactionMode: SkillTreeInteractionMode;
  selectedSkill: SkillProgressResponse | null;
  moveSource: SkillProgressResponse | null;
  submitting: boolean;
  onStartMove: () => void;
  onOpenCreate: () => void;
  onCancelMove: () => void;
};

export default function SkillTreeToolbar({
  interactionMode,
  selectedSkill,
  moveSource,
  submitting,
  onStartMove,
  onOpenCreate,
  onCancelMove,
}: SkillTreeToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="ds-skill-tree-toolbar">
      <div className="ds-skill-tree-toolbar__actions">
        <button
          type="button"
          className={`ds-btn-primary-compact ${interactionMode === "move" ? "ds-skill-tree-toolbar__btn--active" : ""}`}
          onClick={onStartMove}
          disabled={submitting || !selectedSkill}
        >
          {t("skills.moveSkill")}
        </button>
        <button
          type="button"
          className="ds-btn-primary-compact"
          onClick={onOpenCreate}
          disabled={submitting || interactionMode === "move"}
        >
          {t("skills.manageSkills")}
        </button>
        {interactionMode === "move" && (
          <button
            type="button"
            className="ds-skill-tree-toolbar__cancel ds-focus"
            onClick={onCancelMove}
            disabled={submitting}
          >
            {t("common.cancel")}
          </button>
        )}
      </div>

      {interactionMode === "move" && moveSource && (
        <p className="ds-skill-tree-toolbar__hint">
          {t("skills.movePickTarget", { name: moveSource.name })}
        </p>
      )}
    </div>
  );
}
