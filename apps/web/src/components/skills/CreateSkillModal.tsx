import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { SkillCategoryResponse, SkillProgressResponse } from "@/lib/api/types";
import {
  buildSkillParentOptions,
  findDefaultParentKey,
} from "@/lib/skills/buildSkillParentOptions";

type CreateMode = "skill" | "category";

type CreateSkillModalProps = {
  open: boolean;
  categories: SkillCategoryResponse[];
  selectedSkill: SkillProgressResponse | null;
  submitting: boolean;
  onClose: () => void;
  onCreate: (input: {
    name: string;
    description: string;
    categoryId: string;
    parentSkillId: string | null;
  }) => Promise<void>;
  onCreateCategory: (input: { name: string }) => Promise<void>;
};

export default function CreateSkillModal({
  open,
  categories,
  selectedSkill,
  submitting,
  onClose,
  onCreate,
  onCreateCategory,
}: CreateSkillModalProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<CreateMode>("skill");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentKey, setParentKey] = useState<string | null>(null);

  const parentOptions = useMemo(() => buildSkillParentOptions(categories), [categories]);
  const optionsByCategory = useMemo(() => {
    const grouped = new Map<string, typeof parentOptions>();

    for (const option of parentOptions) {
      const list = grouped.get(option.categoryId) ?? [];
      list.push(option);
      grouped.set(option.categoryId, list);
    }

    return grouped;
  }, [parentOptions]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setMode("skill");
    setName("");
    setDescription("");
    setParentKey(findDefaultParentKey(parentOptions, selectedSkill?.id ?? null));
  }, [open, parentOptions, selectedSkill?.id]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, submitting]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (mode === "category") {
      await onCreateCategory({ name: name.trim() });
      return;
    }

    const parent = parentOptions.find((option) => option.key === parentKey);

    if (!parent) {
      return;
    }

    await onCreate({
      name: name.trim(),
      description: description.trim(),
      categoryId: parent.categoryId,
      parentSkillId: parent.parentSkillId,
    });
  }

  const title =
    mode === "category" ? t("skills.createCategoryTitle") : t("skills.createSkillTitle");

  return (
    <div className="ds-skill-create-modal" role="presentation" onClick={onClose}>
      <div
        className="ds-skill-create-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-skill-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ds-skill-create-modal__head">
          <h3 id="create-skill-title" className="ds-skill-create-modal__title">
            {title}
          </h3>
          <button
            type="button"
            className="ds-skill-create-modal__close ds-focus"
            onClick={onClose}
            disabled={submitting}
          >
            {t("common.close")}
          </button>
        </div>

        <div className="ds-skill-create-modal__mode" role="tablist" aria-label={title}>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "skill"}
            className={`ds-skill-create-modal__mode-btn ${mode === "skill" ? "ds-skill-create-modal__mode-btn--active" : ""}`}
            onClick={() => setMode("skill")}
            disabled={submitting}
          >
            {t("skills.createModeSkill")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "category"}
            className={`ds-skill-create-modal__mode-btn ${mode === "category" ? "ds-skill-create-modal__mode-btn--active" : ""}`}
            onClick={() => setMode("category")}
            disabled={submitting}
          >
            {t("skills.createModeCategory")}
          </button>
        </div>

        <form className="ds-skill-create-modal__form" onSubmit={handleSubmit}>
          {mode === "category" ? (
            <>
              <p className="ds-skill-create-modal__hint">{t("skills.createCategoryHint")}</p>
              <label className="ds-skill-create-modal__field">
                <span>{t("skills.createCategoryName")}</span>
                <input
                  className="ds-skill-create-modal__input ds-focus"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  required
                  autoFocus
                />
              </label>
            </>
          ) : (
            <>
              <label className="ds-skill-create-modal__field">
                <span>{t("skills.createName")}</span>
                <input
                  className="ds-skill-create-modal__input ds-focus"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  required
                  autoFocus
                />
              </label>

              <label className="ds-skill-create-modal__field">
                <span>{t("skills.createDescription")}</span>
                <textarea
                  className="ds-skill-create-modal__textarea ds-focus"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={500}
                  rows={2}
                />
              </label>

              <fieldset className="ds-skill-create-modal__field">
                <legend>{t("skills.createParent")}</legend>
                <p className="ds-skill-create-modal__hint">{t("skills.createParentHint")}</p>
                <div className="ds-skill-parent-picker ds-scroll-area">
                  {categories.map((category) => {
                    const options = optionsByCategory.get(category.id) ?? [];

                    return (
                      <section key={category.id} className="ds-skill-parent-picker__group">
                        <p className="ds-skill-parent-picker__heading">{category.name}</p>
                        <ul className="ds-skill-parent-picker__list">
                          {options.map((option) => (
                            <li key={option.key}>
                              <label
                                className={`ds-skill-parent-picker__option ${parentKey === option.key ? "ds-skill-parent-picker__option--selected" : ""}`}
                                style={{ paddingLeft: `${option.depth * 0.75}rem` }}
                              >
                                <input
                                  type="radio"
                                  name="skill-parent"
                                  value={option.key}
                                  checked={parentKey === option.key}
                                  onChange={() => setParentKey(option.key)}
                                />
                                <span>
                                  {option.isRoot
                                    ? t("skills.primaryLevelOption", { category: category.name })
                                    : option.label}
                                </span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              </fieldset>
            </>
          )}

          <div className="ds-skill-create-modal__actions">
            <button
              type="button"
              className="ds-skill-create-modal__cancel ds-focus"
              onClick={onClose}
              disabled={submitting}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="ds-btn-primary-compact"
              disabled={
                submitting ||
                !name.trim() ||
                (mode === "skill" && !parentKey)
              }
            >
              {submitting
                ? t("common.creating")
                : mode === "category"
                  ? t("skills.createCategory")
                  : t("skills.createSkill")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
