import type { SkillGraphNodeDef } from "./skillGraphDefinition";

export type SkillGraphLayoutNode = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const SKILL_NODE_WIDTH = 120;
export const SKILL_NODE_HEIGHT = 64;
export const CATEGORY_NODE_WIDTH = 140;
export const CATEGORY_NODE_HEIGHT = 72;
export const SKILL_GRAPH_H_GAP = 24;
export const SKILL_GRAPH_V_GAP = 88;

type LayoutResult = {
  nodes: SkillGraphLayoutNode[];
  width: number;
  height: number;
};

function nodeSize(kind: SkillGraphNodeDef["kind"]): { width: number; height: number } {
  if (kind === "category") {
    return { width: CATEGORY_NODE_WIDTH, height: CATEGORY_NODE_HEIGHT };
  }

  return { width: SKILL_NODE_WIDTH, height: SKILL_NODE_HEIGHT };
}

function layoutSubtree(
  nodeId: string,
  depth: number,
  nodesById: Record<string, SkillGraphNodeDef>,
  xOffset: number,
): { layouts: SkillGraphLayoutNode[]; nextX: number; subtreeWidth: number } {
  const node = nodesById[nodeId];

  if (!node) {
    return { layouts: [], nextX: xOffset, subtreeWidth: 0 };
  }

  const size = nodeSize(node.kind);

  if (node.children.length === 0) {
    const layout: SkillGraphLayoutNode = {
      id: nodeId,
      x: xOffset,
      y: depth * SKILL_GRAPH_V_GAP,
      width: size.width,
      height: size.height,
    };

    return {
      layouts: [layout],
      nextX: xOffset + size.width + SKILL_GRAPH_H_GAP,
      subtreeWidth: size.width,
    };
  }

  let cursor = xOffset;
  const childLayouts: SkillGraphLayoutNode[] = [];

  for (const childId of node.children) {
    const childResult = layoutSubtree(childId, depth + 1, nodesById, cursor);
    childLayouts.push(...childResult.layouts);
    cursor = childResult.nextX;
  }

  const firstChild = childLayouts[0];
  const lastChild = childLayouts[childLayouts.length - 1];

  if (!firstChild || !lastChild) {
    const layout: SkillGraphLayoutNode = {
      id: nodeId,
      x: xOffset,
      y: depth * SKILL_GRAPH_V_GAP,
      width: size.width,
      height: size.height,
    };

    return {
      layouts: [layout],
      nextX: xOffset + size.width + SKILL_GRAPH_H_GAP,
      subtreeWidth: size.width,
    };
  }

  const centerX =
    firstChild.x +
    firstChild.width / 2 +
    (lastChild.x + lastChild.width / 2 - (firstChild.x + firstChild.width / 2)) / 2 -
    size.width / 2;

  const parentLayout: SkillGraphLayoutNode = {
    id: nodeId,
    x: Math.max(xOffset, centerX),
    y: depth * SKILL_GRAPH_V_GAP,
    width: size.width,
    height: size.height,
  };

  const subtreeWidth = Math.max(
    cursor - xOffset - SKILL_GRAPH_H_GAP,
    parentLayout.x + parentLayout.width - xOffset,
  );

  return {
    layouts: [parentLayout, ...childLayouts],
    nextX: xOffset + subtreeWidth + SKILL_GRAPH_H_GAP,
    subtreeWidth,
  };
}

export function layoutSkillGraph(
  rootId: string,
  nodesById: Record<string, SkillGraphNodeDef>,
): LayoutResult {
  const { layouts, nextX } = layoutSubtree(rootId, 0, nodesById, 0);
  const root = nodesById[rootId];
  const rootSize = root ? nodeSize(root.kind) : { width: 0, height: 0 };
  const maxDepth = layouts.reduce((max, node) => Math.max(max, node.y), 0);
  const width = Math.max(nextX - SKILL_GRAPH_H_GAP, rootSize.width);
  const height = maxDepth + rootSize.height + 32;

  return { nodes: layouts, width, height };
}

export function getNodeCenter(node: SkillGraphLayoutNode): { x: number; y: number } {
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  };
}
