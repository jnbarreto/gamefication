type ProgressBarProps = {
  value: number;
  label?: string;
  compact?: boolean;
};

export default function ProgressBar({ value, label, compact = false }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 1);

  if (compact) {
    return (
      <div className="ds-xp-track-compact">
        <div className="ds-xp-track-compact__meta">
          {label && <span className="ds-xp-track-compact__label">{label}</span>}
          <span className="ds-xp-track-compact__pct">{Math.round(clamped * 100)}%</span>
        </div>
        <div className="ds-xp-track ds-xp-track--compact">
          <div className="ds-xp-fill" style={{ width: `${clamped * 100}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <div className="mb-2 flex justify-between text-small text-foreground-muted">
          <span>{label}</span>
          <span className="font-mono text-micro">{Math.round(clamped * 100)}%</span>
        </div>
      )}
      <div className="ds-xp-track">
        <div className="ds-xp-fill" style={{ width: `${clamped * 100}%` }} />
      </div>
    </div>
  );
}
