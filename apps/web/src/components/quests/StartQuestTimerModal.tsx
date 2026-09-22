import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

type StartQuestTimerModalProps = {
  open: boolean;
  questTitle: string;
  onConfirm: (startTimer: boolean) => void;
  onClose: () => void;
};

export default function StartQuestTimerModal({
  open,
  questTitle,
  onConfirm,
  onClose,
}: StartQuestTimerModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="start-timer-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-sm rounded-panel border border-border/40 bg-surface p-5 shadow-2xl space-y-4 relative"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-accent/10 border border-accent/30 font-mono text-xs text-accent">
              ⧗
            </span>
            <div>
              <h3
                id="start-timer-modal-title"
                className="font-flavor text-base font-semibold text-foreground tracking-wide"
              >
                {t("questTimer.modalTitle", { defaultValue: "Iniciar Jornada" })}
              </h3>
              <p
                className="line-clamp-1 font-flavor italic text-micro text-foreground-muted mt-0.5"
                title={questTitle}
              >
                {questTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-foreground-muted/60 hover:text-foreground text-xs px-1.5 py-0.5 rounded transition-colors ds-focus"
            aria-label={t("common.close", { defaultValue: "Fechar" })}
          >
            ✕
          </button>
        </div>

        <div className="rounded border border-border/20 bg-surface-muted/30 p-3 space-y-1.5">
          <p className="text-small font-medium text-foreground">
            {t("questTimer.modalQuestion", {
              defaultValue: "Deseja cronometrar esta jornada?",
            })}
          </p>
          <p className="text-micro text-foreground-muted leading-relaxed font-sans">
            {t("questTimer.modalHint", {
              defaultValue:
                "O tempo será registrado e a duração de cada missão será calculada conforme você as conclui.",
            })}
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => onConfirm(true)}
            className="flex items-center justify-center gap-2 rounded px-3 py-2 text-xs font-mono font-medium text-accent border border-accent/50 bg-accent/10 hover:bg-accent/20 transition-colors shadow-[0_0_10px_rgba(0,255,102,0.12)] ds-focus"
          >
            <span>⧗</span>
            <span>{t("questTimer.startWithTimer", { defaultValue: "Cronometrar jornada" })}</span>
          </button>

          <button
            type="button"
            onClick={() => onConfirm(false)}
            className="rounded px-3 py-2 text-xs font-mono text-foreground-muted hover:text-foreground border border-border/30 hover:bg-surface-muted/40 transition-colors text-center ds-focus"
          >
            {t("questTimer.startWithoutTimer", { defaultValue: "Iniciar sem cronômetro" })}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-center text-micro text-foreground-muted/60 hover:text-foreground-muted transition-colors pt-0.5"
          >
            {t("common.cancel", { defaultValue: "Cancelar" })}
          </button>
        </div>
      </div>
    </div>
  );
}
