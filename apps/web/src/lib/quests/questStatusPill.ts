export function questStatusPillToneClass(status: string): string {
  switch (status) {
    case "IN_PROGRESS":
      return "bg-accent/15 text-accent";
    case "COMPLETED":
      return "bg-success/15 text-success";
    case "CANCELLED":
      return "bg-foreground-muted/15 text-foreground-muted";
    default:
      return "bg-surface-muted text-foreground-muted";
  }
}

export const questStatusPillBaseClass =
  "inline-flex rounded-full px-3 py-1 text-xs font-medium";

export function questStatusPillClass(status: string): string {
  return `${questStatusPillBaseClass} ${questStatusPillToneClass(status)}`;
}

export const questReopenPillButtonClass = `${questStatusPillBaseClass} bg-accent text-base ds-focus cursor-pointer border-0 transition-colors duration-fast ease-out hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50`;
