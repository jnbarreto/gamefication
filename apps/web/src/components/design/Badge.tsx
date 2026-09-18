type BadgeVariant = "accent" | "success" | "warning" | "muted";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  accent: "ds-badge--accent",
  success: "ds-badge--success",
  warning: "ds-badge--warning",
  muted: "ds-badge--muted",
};

export default function Badge({
  children,
  variant = "muted",
  className = "",
}: BadgeProps) {
  return (
    <span className={`ds-badge ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
