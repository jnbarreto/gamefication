type StatBlockProps = {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "xp" | "success" | "accent";
  className?: string;
};

const toneClasses = {
  default: "text-foreground",
  xp: "text-xp",
  success: "text-success",
  accent: "text-accent",
} as const;

export default function StatBlock({
  label,
  value,
  tone = "default",
  className = "",
}: StatBlockProps) {
  return (
    <div className={`ds-stat ${className}`}>
      <dt className="ds-stat__label">{label}</dt>
      <dd className={`ds-stat__value ${toneClasses[tone]}`}>{value}</dd>
    </div>
  );
}
