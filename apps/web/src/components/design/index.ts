export { default as Badge } from "./Badge";
export { default as LinearProgressBar } from "./LinearProgressBar";
export { default as Panel } from "./Panel";
export { default as SegmentedProgressBar } from "./SegmentedProgressBar";
export { default as StatBlock } from "./StatBlock";

export type QuestStatusVisual = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "BOSS";

export function questItemClass(status: string, type?: string): string {
  if (type === "BOSS" || status === "BOSS") {
    return "ds-quest-item ds-quest-item--boss";
  }

  switch (status) {
    case "IN_PROGRESS":
      return "ds-quest-item ds-quest-item--progress";
    case "COMPLETED":
      return "ds-quest-item ds-quest-item--done";
    case "CANCELLED":
    case "TODO":
    default:
      return "ds-quest-item ds-quest-item--todo";
  }
}

export function badgeVariantForQuestStatus(
  status: string,
): "accent" | "success" | "warning" | "muted" {
  switch (status) {
    case "IN_PROGRESS":
      return "accent";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "muted";
    default:
      return "muted";
  }
}
