type SegmentedProgressBarProps = {
  value: number;
  segments?: number;
  label?: string;
  showPercent?: boolean;
};

export default function SegmentedProgressBar({
  value,
  segments = 10,
  label,
  showPercent = true,
}: SegmentedProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const filledSegments = Math.round(clamped * segments);

  return (
    <div>
      {(label || showPercent) && (
        <div className="mb-2 flex justify-between text-small text-foreground-muted">
          {label && <span>{label}</span>}
          {showPercent && (
            <span className="font-mono text-micro">
              {Math.round(clamped * 100)}%
            </span>
          )}
        </div>
      )}

      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))` }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped * 100)}
        aria-label={label}
      >
        {Array.from({ length: segments }, (_, index) => {
          const isFilled = index < filledSegments;

          return (
            <div
              key={index}
              className={`h-2 rounded-panel transition-colors duration-slow ease-out ${
                isFilled ? "bg-xp" : "bg-surface-muted"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
