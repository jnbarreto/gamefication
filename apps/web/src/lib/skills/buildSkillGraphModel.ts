import type { SkillCategoryResponse, SkillProgressResponse } from "@/lib/api/types";

import { categoryKeyFromName } from "./skillGraphDefinition";
import { layoutSkillGraph } from "./layoutSkillGraph";

export type SkillGraphNodeKind = "category" | "skill";

export type SkillGraphNodeDef = {
  id: string;
  slug?: string;
  label: string;
  kind: SkillGraphNodeKind;
  children: string[];
};

export type SkillGraphNodeState = "learned" | "available";

export type SkillGraphNodeMeta = {
  id: string;
  slug: string | null;
  label: string;
  kind: SkillGraphNodeKind;
  state: SkillGraphNodeState;
  progress: SkillProgressResponse | null;
  childIds: string[];
};

export type SkillGraphEdge = {
  fromId: string;
  toId: string;
};

export type SkillGraphModel = {
  categoryId: string;
  categoryName: string;
  isCustomCategory: boolean;
  rootId: string;
  nodesById: Record<string, SkillGraphNodeMeta>;
  edges: SkillGraphEdge[];
  learnedCount: number;
  totalSkills: number;
};

export type SkillGraphViewport = {
  width: number;
  height: number;
  visibleNodes: SkillGraphNodeMeta[];
  visibleEdges: SkillGraphEdge[];
  layoutById: Map<string, { x: number; y: number; width: number; height: number }>;
};

function isSkillLearned(progress: SkillProgressResponse | null): boolean {
  if (!progress) {
    return false;
  }

  return progress.xp > 0 || progress.masteryLevel !== "UNKNOWN";
}

function buildEdges(nodesById: Record<string, SkillGraphNodeMeta>): SkillGraphEdge[] {
  const edges: SkillGraphEdge[] = [];

  for (const node of Object.values(nodesById)) {
    for (const childId of node.childIds) {
      edges.push({ fromId: node.id, toId: childId });
    }
  }

  return edges;
}

function buildVisibleDefs(
  rootId: string,
  nodesById: Record<string, SkillGraphNodeDef>,
  expandedIds: ReadonlySet<string>,
): Record<string, SkillGraphNodeDef> {
  const visible: Record<string, SkillGraphNodeDef> = {};

  function visit(nodeId: string) {
    const node = nodesById[nodeId];

    if (!node) {
      return;
    }

    const isExpanded = expandedIds.has(nodeId);
    visible[nodeId] = {
      ...node,
      children: isExpanded ? node.children : [],
    };

    if (isExpanded) {
      for (const childId of node.children) {
        visit(childId);
      }
    }
  }

  visit(rootId);

  return visible;
}

export function buildNodeDefsFromModel(
  model: SkillGraphModel,
): Record<string, SkillGraphNodeDef> {
  const defs: Record<string, SkillGraphNodeDef> = {};

  for (const node of Object.values(model.nodesById)) {
    defs[node.id] = {
      id: node.id,
      slug: node.slug ?? undefined,
      label: node.label,
      kind: node.kind,
      children: node.childIds,
    };
  }

  return defs;
}

export function computeSkillGraphViewport(
  model: SkillGraphModel,
  expandedIds: ReadonlySet<string>,
  nodeDefs: Record<string, SkillGraphNodeDef> = buildNodeDefsFromModel(model),
): SkillGraphViewport {
  const visibleDefs = buildVisibleDefs(model.rootId, nodeDefs, expandedIds);
  const layout = layoutSkillGraph(model.rootId, visibleDefs);
  const layoutById = new Map(
    layout.nodes.map((node) => [
      node.id,
      { x: node.x, y: node.y, width: node.width, height: node.height },
    ]),
  );

  const visibleNodeIds = new Set(Object.keys(visibleDefs));
  const visibleNodes = Object.values(model.nodesById).filter((node) =>
    visibleNodeIds.has(node.id),
  );
  const visibleEdges = model.edges.filter(
    (edge) => visibleNodeIds.has(edge.fromId) && visibleNodeIds.has(edge.toId),
  );

  return {
    width: layout.width,
    height: layout.height,
    visibleNodes,
    visibleEdges,
    layoutById,
  };
}

export function buildSkillGraphModel(category: SkillCategoryResponse): SkillGraphModel {
  const rootId = `${categoryKeyFromName(category.name)}-root`;
  const childrenByParent = new Map<string | null, SkillProgressResponse[]>();

  for (const skill of category.skills) {
    const parentKey = skill.parentSkillId;
    const siblings = childrenByParent.get(parentKey) ?? [];
    siblings.push(skill);
    childrenByParent.set(parentKey, siblings);
  }

  for (const siblings of childrenByParent.values()) {
    siblings.sort((left, right) => {
      if (left.displayOrder !== right.displayOrder) {
        return left.displayOrder - right.displayOrder;
      }

      return left.name.localeCompare(right.name);
    });
  }

  const nodesById: Record<string, SkillGraphNodeMeta> = {};
  let learnedCount = 0;

  nodesById[rootId] = {
    id: rootId,
    slug: null,
    label: category.name,
    kind: "category",
    state: "available",
    progress: null,
    childIds: (childrenByParent.get(null) ?? []).map((skill) => skill.id),
  };

  for (const skill of category.skills) {
    const progress = skill;
    const learned = isSkillLearned(progress);

    if (learned) {
      learnedCount += 1;
    }

    nodesById[skill.id] = {
      id: skill.id,
      slug: skill.slug,
      label: skill.name,
      kind: "skill",
      state: learned ? "learned" : "available",
      progress,
      childIds: (childrenByParent.get(skill.id) ?? []).map((child) => child.id),
    };
  }

  return {
    categoryId: category.id,
    categoryName: category.name,
    isCustomCategory: category.isCustom,
    rootId,
    nodesById,
    edges: buildEdges(nodesById),
    learnedCount,
    totalSkills: category.skills.length,
  };
}

export function buildSkillGraphModels(
  categories: SkillCategoryResponse[],
): SkillGraphModel[] {
  return categories.map((category) => buildSkillGraphModel(category));
}

export function countHiddenDescendants(
  nodeId: string,
  nodesById: Record<string, SkillGraphNodeMeta>,
  expandedIds: ReadonlySet<string>,
): number {
  const node = nodesById[nodeId];

  if (!node || expandedIds.has(nodeId)) {
    return 0;
  }

  let count = 0;

  function walk(id: string) {
    const current = nodesById[id];

    if (!current) {
      return;
    }

    for (const childId of current.childIds) {
      count += 1;
      walk(childId);
    }
  }

  for (const childId of node.childIds) {
    count += 1;
    walk(childId);
  }

  return count;
}

export function countSkillGraphStates(models: SkillGraphModel[]): {
  learned: number;
  available: number;
} {
  let learned = 0;
  let available = 0;

  for (const model of models) {
    for (const node of Object.values(model.nodesById)) {
      if (node.kind !== "skill") {
        continue;
      }

      if (node.state === "learned") {
        learned += 1;
      } else {
        available += 1;
      }
    }
  }

  return { learned, available };
}

export function findGraphNodeBySlug(
  models: SkillGraphModel[],
  slug: string,
): { model: SkillGraphModel; node: SkillGraphNodeMeta } | null {
  for (const model of models) {
    for (const node of Object.values(model.nodesById)) {
      if (node.slug === slug) {
        return { model, node };
      }
    }
  }

  return null;
}
