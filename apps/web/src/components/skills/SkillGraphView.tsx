import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { SkillProgressResponse } from "@/lib/api/types";
import type { SkillTreeInteractionMode } from "@/components/skills/SkillTreeToolbar";
import {
  buildNodeDefsFromModel,
  computeSkillGraphViewport,
  countHiddenDescendants,
  type SkillGraphModel,
  type SkillGraphNodeDef,
  type SkillGraphNodeMeta,
} from "@/lib/skills/buildSkillGraphModel";

type SkillGraphCanvasProps = {
  model: SkillGraphModel;
  selectedSlug: string | null;
  interactionMode: SkillTreeInteractionMode;
  moveSourceId: string | null;
  onSelect: (slug: string | null, progress: SkillProgressResponse | null) => void;
  onCategorySelect?: (categoryId: string) => void;
  onTreeActionClick?: (node: SkillGraphNodeMeta, model: SkillGraphModel) => void;
};

function nodeClassName(
  node: SkillGraphNodeMeta,
  selectedSlug: string | null,
  moveSourceId: string | null,
  isExpanded: boolean,
  hasHiddenChildren: boolean,
): string {
  const classes = ["ds-skill-node", "ds-focus"];

  if (node.kind === "category") {
    classes.push("ds-skill-node--hub");
  } else if (node.state === "learned") {
    classes.push("ds-skill-node--learned");

    if (node.progress?.isStale) {
      classes.push("ds-skill-node--stale");
    }
  } else {
    classes.push("ds-skill-node--available");
  }

  if (hasHiddenChildren) {
    classes.push("ds-skill-node--sealed");
  }

  if (isExpanded && node.childIds.length > 0) {
    classes.push("ds-skill-node--open");
  }

  if (node.slug && node.slug === selectedSlug) {
    classes.push("ds-skill-node--selected");
  }

  if (moveSourceId && node.id === moveSourceId) {
    classes.push("ds-skill-node--moving");
  }

  return classes.join(" ");
}

function SkillGraphCanvas({
  model,
  selectedSlug,
  interactionMode,
  moveSourceId,
  onSelect,
  onCategorySelect,
  onTreeActionClick,
}: SkillGraphCanvasProps) {
  const { t } = useTranslation();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const nodeDefs = useMemo<Record<string, SkillGraphNodeDef>>(
    () => buildNodeDefsFromModel(model),
    [model],
  );

  const viewport = useMemo(
    () => computeSkillGraphViewport(model, expandedIds, nodeDefs),
    [model, expandedIds, nodeDefs],
  );

  const nodeById = useMemo(
    () => new Map(viewport.visibleNodes.map((node) => [node.id, node])),
    [viewport.visibleNodes],
  );

  function toggleExpand(nodeId: string) {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }

      return next;
    });
  }

  function handleNodeClick(node: SkillGraphNodeMeta) {
    if (interactionMode === "move") {
      onTreeActionClick?.(node, model);
      return;
    }

    if (node.kind === "category") {
      onCategorySelect?.(model.categoryId);

      if (node.childIds.length > 0) {
        toggleExpand(node.id);
      }

      return;
    }

    if (node.childIds.length > 0) {
      toggleExpand(node.id);
    }

    if (node.slug) {
      onSelect(node.slug, node.progress);
    }
  }

  return (
    <div className="ds-skill-tree-board">
      <div className="ds-skill-tree-board__header">
        <div>
          <p className="font-mono text-micro text-info">{model.categoryName}</p>
          <p className="ds-skill-tree-board__progress">
            {t("skills.graphProgress", {
              learned: model.learnedCount,
              total: model.totalSkills,
            })}
          </p>
        </div>
        <p className="ds-skill-tree-board__hint">
          {interactionMode === "move" ? t("skills.moveGraphHint") : t("skills.graphTapToExpand")}
        </p>
      </div>

      <div className="ds-skill-graph">
        <div
          className="ds-skill-graph__viewport"
          style={{ width: viewport.width, height: viewport.height }}
        >
          <svg
            className="ds-skill-graph__edges"
            width={viewport.width}
            height={viewport.height}
            aria-hidden="true"
          >
            {viewport.visibleEdges.map((edge) => {
              const fromNode = nodeById.get(edge.fromId);
              const toNode = nodeById.get(edge.toId);
              const fromLayout = viewport.layoutById.get(edge.fromId);
              const toLayout = viewport.layoutById.get(edge.toId);

              if (!fromNode || !toNode || !fromLayout || !toLayout) {
                return null;
              }

              const fromX = fromLayout.x + fromLayout.width / 2;
              const fromY = fromLayout.y + fromLayout.height;
              const toX = toLayout.x + toLayout.width / 2;
              const toY = toLayout.y;
              const midY = (fromY + toY) / 2;
              const isActive =
                fromNode.state === "learned" && toNode.state === "learned";

              return (
                <path
                  key={`${edge.fromId}-${edge.toId}`}
                  d={`M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`}
                  className={
                    isActive ? "ds-skill-graph__edge ds-skill-graph__edge--active" : "ds-skill-graph__edge"
                  }
                />
              );
            })}
          </svg>

          {viewport.visibleNodes.map((node) => {
            const layout = viewport.layoutById.get(node.id);

            if (!layout) {
              return null;
            }

            const isExpanded = expandedIds.has(node.id);
            const hiddenCount = countHiddenDescendants(node.id, model.nodesById, expandedIds);
            const hasHiddenChildren = hiddenCount > 0;

            return (
              <button
                key={node.id}
                type="button"
                className={nodeClassName(
                  node,
                  selectedSlug,
                  moveSourceId,
                  isExpanded,
                  hasHiddenChildren,
                )}
                style={{
                  left: layout.x,
                  top: layout.y,
                  width: layout.width,
                  height: layout.height,
                }}
                onClick={() => handleNodeClick(node)}
                aria-expanded={node.childIds.length > 0 ? isExpanded : undefined}
                aria-label={
                  node.kind === "category"
                    ? `${node.label}, ${t("skills.graphHiddenSkills", { count: hiddenCount })}`
                    : `${node.label}${node.progress ? `, ${node.progress.xp} ${t("common.xp")}` : ""}`
                }
              >
                <span className="ds-skill-node__gem" aria-hidden="true">
                  {node.kind === "category" ? "✦" : hasHiddenChildren ? "◆" : "⬡"}
                </span>

                <span className="ds-skill-node__label">{node.label}</span>

                {hasHiddenChildren && (
                  <span className="ds-skill-node__sealed">
                    {t("skills.graphHiddenSkills", { count: hiddenCount })}
                  </span>
                )}

                {interactionMode === "normal" && node.childIds.length > 0 && (
                  <span className="ds-skill-node__chevron" aria-hidden="true">
                    {isExpanded ? "▾" : "▸"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type SkillGraphLegendProps = {
  learnedCount: number;
  availableCount: number;
};

export function SkillGraphLegend({ learnedCount, availableCount }: SkillGraphLegendProps) {
  const { t } = useTranslation();

  return (
    <div className="ds-skill-graph-legend">
      <span className="ds-skill-graph-legend__item">
        <span className="ds-skill-graph-legend__swatch ds-skill-graph-legend__swatch--learned" />
        {t("skills.graphLearned", { count: learnedCount })}
      </span>
      <span className="ds-skill-graph-legend__item">
        <span className="ds-skill-graph-legend__swatch ds-skill-graph-legend__swatch--available" />
        {t("skills.graphAvailable", { count: availableCount })}
      </span>
      <span className="ds-skill-graph-legend__item">
        <span className="ds-skill-graph-legend__swatch ds-skill-graph-legend__swatch--sealed" />
        {t("skills.graphSealed")}
      </span>
    </div>
  );
}

type SkillGraphForestProps = {
  models: SkillGraphModel[];
  selectedSlug: string | null;
  interactionMode: SkillTreeInteractionMode;
  moveSourceId: string | null;
  onSelect: (slug: string | null, progress: SkillProgressResponse | null) => void;
  onCategorySelect?: (categoryId: string) => void;
  onTreeActionClick?: (node: SkillGraphNodeMeta, model: SkillGraphModel) => void;
};

export function SkillGraphForest({
  models,
  selectedSlug,
  interactionMode,
  moveSourceId,
  onSelect,
  onCategorySelect,
  onTreeActionClick,
}: SkillGraphForestProps) {
  const { t } = useTranslation();

  if (models.length === 0) {
    return <p className="ds-empty">{t("skills.noSkills")}</p>;
  }

  return (
    <div className="space-y-8">
      {models.map((model) => (
        <section key={model.categoryName} className="ds-skill-graph-section">
          <SkillGraphCanvas
            model={model}
            selectedSlug={selectedSlug}
            interactionMode={interactionMode}
            moveSourceId={moveSourceId}
            onSelect={onSelect}
            onCategorySelect={onCategorySelect}
            onTreeActionClick={onTreeActionClick}
          />
        </section>
      ))}
    </div>
  );
}
