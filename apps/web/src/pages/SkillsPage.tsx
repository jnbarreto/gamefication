import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Panel } from "@/components/design";
import { SkillGraphLegend } from "@/components/skills/SkillGraphView";
import CreateSkillModal from "@/components/skills/CreateSkillModal";
import SkillDescriptionModal from "@/components/skills/SkillDescriptionModal";
import CategoryDetailStrip from "@/components/skills/CategoryDetailStrip";
import SkillDetailStrip from "@/components/skills/SkillDetailStrip";
import SkillRankingPanel from "@/components/skills/SkillRankingPanel";
import SkillTreeToolbar, {
  type SkillTreeInteractionMode,
} from "@/components/skills/SkillTreeToolbar";
import { SkillGraphForest } from "@/components/skills/SkillGraphView";
import { ApiError } from "@/lib/api/client";
import { useConfirm } from "@/lib/confirm/ConfirmDialogProvider";
import {
  createSkill,
  createSkillCategory,
  deleteSkill,
  deleteSkillCategory,
  fetchSkillTree,
  fetchStaleSkills,
  updateSkill,
} from "@/lib/api/skills";
import {
  buildSkillGraphModels,
  countSkillGraphStates,
} from "@/lib/skills/buildSkillGraphModel";
import type { SkillGraphNodeMeta, SkillGraphModel } from "@/lib/skills/buildSkillGraphModel";
import { sortSkillCategories } from "@/lib/skills/sortSkillCategories";
import type { SkillProgressResponse, StaleSkillResponse } from "@/lib/api/types";

function EmptyState({ message }: { message: string }) {
  return <p className="ds-empty">{message}</p>;
}

async function reloadSkills(
  setCategories: (categories: Awaited<ReturnType<typeof fetchSkillTree>>["categories"]) => void,
  setStaleSkills: (skills: StaleSkillResponse[]) => void,
) {
  const [treeResult, staleResult] = await Promise.all([fetchSkillTree(), fetchStaleSkills()]);
  setCategories(treeResult.categories);
  setStaleSkills(staleResult.skills);
}

export default function SkillsPage() {
  const { t } = useTranslation();
  const { confirm } = useConfirm();
  const [categories, setCategories] = useState<Awaited<
    ReturnType<typeof fetchSkillTree>
  >["categories"]>([]);
  const [staleSkills, setStaleSkills] = useState<StaleSkillResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillProgressResponse | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<SkillTreeInteractionMode>("normal");
  const [moveSource, setMoveSource] = useState<SkillProgressResponse | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [treeResult, staleResult] = await Promise.all([
          fetchSkillTree(),
          fetchStaleSkills(),
        ]);

        if (cancelled) {
          return;
        }

        setCategories(treeResult.categories);
        setStaleSkills(staleResult.skills);
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
  }, [t]);

  const sortedCategories = useMemo(() => sortSkillCategories(categories), [categories]);
  const graphModels = useMemo(
    () => buildSkillGraphModels(sortedCategories),
    [sortedCategories],
  );
  const skillGraphTotals = useMemo(
    () => countSkillGraphStates(graphModels),
    [graphModels],
  );

  const totalSkills = categories.reduce(
    (count, category) => count + category.skills.length,
    0,
  );

  const refreshTree = useCallback(async () => {
    await reloadSkills(setCategories, setStaleSkills);
  }, []);

  function resetMoveMode() {
    setInteractionMode("normal");
    setMoveSource(null);
  }

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  function handleSkillSelect(slug: string | null, progress: SkillProgressResponse | null) {
    setSelectedCategoryId(null);

    if (progress) {
      setSelectedSkill(progress);
      return;
    }

    if (!slug) {
      return;
    }

    const skill = categories
      .flatMap((category) => category.skills)
      .find((entry) => entry.slug === slug);

    setSelectedSkill(skill ?? null);
  }

  async function handleTreeActionClick(node: SkillGraphNodeMeta, _model: SkillGraphModel) {
    if (interactionMode !== "move" || !moveSource) {
      return;
    }

    if (moveSource.id === node.id) {
      return;
    }

    setActionError(null);
    const parentSkillId = node.kind === "category" ? null : node.id;

    try {
      setSubmitting(true);
      await updateSkill(moveSource.id, { parentSkillId });
      await refreshTree();
      resetMoveMode();
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : t("skills.moveFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  function handleStartMove() {
    if (!selectedSkill) {
      return;
    }

    setActionError(null);
    setCreateModalOpen(false);
    setInteractionMode("move");
    setMoveSource(selectedSkill);
  }

  async function handleCreateCategory(input: { name: string }) {
    setActionError(null);

    try {
      setSubmitting(true);
      await createSkillCategory({ name: input.name });
      await refreshTree();
      setCreateModalOpen(false);
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : t("skills.createCategoryFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateSkill(input: {
    name: string;
    description: string;
    categoryId: string;
    parentSkillId: string | null;
  }) {
    setActionError(null);

    try {
      setSubmitting(true);
      const result = await createSkill({
        name: input.name,
        description: input.description || undefined,
        categoryId: input.parentSkillId ? undefined : input.categoryId,
        parentSkillId: input.parentSkillId,
      });

      await refreshTree();
      setSelectedSkill(result.skill);
      setCreateModalOpen(false);
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : t("skills.createFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  function handleCategorySelect(categoryId: string) {
    setSelectedSkill(null);
    setSelectedCategoryId(categoryId);
  }

  async function handleDeleteCategory() {
    if (!selectedCategory?.isCustom) {
      return;
    }

    const skillCount = selectedCategory.skills.length;
    if (skillCount > 0) {
      const confirmed = await confirm({
        title: t("skills.deleteCategory"),
        message: t("skills.deleteCategoryConfirm", { count: skillCount }),
        confirmLabel: t("common.confirm"),
        variant: "danger",
      });

      if (!confirmed) {
        return;
      }
    }

    setActionError(null);

    try {
      setSubmitting(true);
      await deleteSkillCategory(selectedCategory.id);
      setSelectedCategoryId(null);
      await refreshTree();
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : t("skills.deleteCategoryFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSkill() {
    if (!selectedSkill?.isCustom) {
      return;
    }

    setActionError(null);

    try {
      setSubmitting(true);
      await deleteSkill(selectedSkill.id);
      setSelectedSkill(null);
      await refreshTree();
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : t("skills.deleteFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return (
      <div className="ds-error">
        {t("errors.loadSkills", { message: error })} {t("common.runDevApi")}
      </div>
    );
  }

  if (loading) {
    return <p className="text-small text-foreground-muted">{t("skills.loading")}</p>;
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-h1">{t("skills.title")}</h2>
        <p className="mt-2 text-small text-foreground-muted">
          {t("skills.subtitle", {
            categories: categories.length,
            skills: totalSkills,
          })}
        </p>
      </div>

      {actionError && <div className="ds-error">{actionError}</div>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <section className="ds-panel ds-panel--skill-tree">
          <div className="ds-skill-tree-sticky">
            <h2 className="ds-panel__title">{t("skills.skillTree")}</h2>

            <SkillTreeToolbar
              interactionMode={interactionMode}
              selectedSkill={selectedSkill}
              moveSource={moveSource}
              submitting={submitting}
              onStartMove={handleStartMove}
              onOpenCreate={() => setCreateModalOpen(true)}
              onCancelMove={resetMoveMode}
            />

            <SkillGraphLegend
              learnedCount={skillGraphTotals.learned}
              availableCount={skillGraphTotals.available}
            />
          </div>

          <div className="ds-skill-tree-shell">
            <div className="ds-skill-tree-content">
              <SkillGraphForest
                models={graphModels}
                selectedSlug={selectedSkill?.slug ?? null}
                interactionMode={interactionMode}
                moveSourceId={moveSource?.id ?? null}
                onSelect={handleSkillSelect}
                onCategorySelect={handleCategorySelect}
                onTreeActionClick={handleTreeActionClick}
              />
            </div>

            <CreateSkillModal
              open={createModalOpen}
              categories={sortedCategories}
              selectedSkill={selectedSkill}
              submitting={submitting}
              onClose={() => setCreateModalOpen(false)}
              onCreate={handleCreateSkill}
              onCreateCategory={handleCreateCategory}
            />
          </div>
        </section>

        <aside className="ds-skill-tree-sidebar flex flex-col gap-3">
          {selectedCategory?.isCustom && !selectedSkill && (
            <CategoryDetailStrip
              category={selectedCategory}
              onDelete={handleDeleteCategory}
              deleting={submitting}
            />
          )}

          {selectedSkill && (
            <SkillDetailStrip
              skill={selectedSkill}
              onShowDescription={
                selectedSkill.description ? () => setDescriptionOpen(true) : undefined
              }
              onDelete={selectedSkill.isCustom ? handleDeleteSkill : undefined}
              deleting={submitting}
            />
          )}

          <Panel title={t("skills.ranking")} className="ds-panel--sidebar">
            <SkillRankingPanel
              categories={sortedCategories}
              selectedSlug={selectedSkill?.slug ?? null}
              onSelect={setSelectedSkill}
            />
          </Panel>

          <Panel title={t("skills.staleAlerts")} className="ds-panel--sidebar">
            {staleSkills.length === 0 ? (
              <EmptyState message={t("skills.allSkillsActive")} />
            ) : (
              <div className="ds-scroll-area ds-scroll-area--sidebar-short">
                <ul className="space-y-1">
                  {staleSkills.map((skill) => (
                    <li
                      key={skill.id}
                      className="ds-log-row ds-log-row--compact flex items-center justify-between gap-2 border-warning/30 bg-warning/10"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-micro font-medium">{skill.name}</p>
                        <p className="truncate text-micro text-foreground-muted">
                          {skill.categoryName}
                        </p>
                      </div>
                      <p className="shrink-0 font-mono text-micro text-warning">
                        {skill.xp} {t("common.xp")}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>
        </aside>
      </div>

      {selectedSkill?.description && (
        <SkillDescriptionModal
          name={selectedSkill.name}
          description={selectedSkill.description}
          open={descriptionOpen}
          onClose={() => setDescriptionOpen(false)}
        />
      )}
    </div>
  );
}
