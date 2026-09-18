type LinearProgressBarProps = {
  value: number;
  label?: string;
  hint?: string;
  showPercent?: boolean;
};

export default function LinearProgressBar({
  value,
  label,
  hint,
  showPercent = true,
}: LinearProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const percent = Math.round(clamped * 100);

  return (
    <div className="ds-linear-progress">
      {(label || showPercent) && (
        <div className="ds-linear-progress__meta">
          {label && <span className="ds-linear-progress__label">{label}</span>}
          {showPercent && (
            <span className="ds-linear-progress__percent">{percent}%</span>
          )}
        </div>
      )}

      <div
        className="ds-linear-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={label}
      >
        <div
          className="ds-linear-progress__fill"
          style={{ width: `${percent}%` }}
        />
      </div>

      {hint && <p className="ds-linear-progress__hint">{hint}</p>}
    </div>
  );
}
