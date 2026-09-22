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
      className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="start-timer-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-panel border border-border/40 bg-surface p-6 shadow-2xl space-y-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-lg text-accent">
              ⏱️
            </span>
            <div>
              <h3
                id="start-timer-modal-title"
                className="text-base font-semibold text-foreground"
              >
                {t("questTimer.modalTitle", { defaultValue: "Iniciar Quest" })}
              </h3>
              <p className="line-clamp-1 text-xs text-foreground-muted mt-0.5" title={questTitle}>
                {questTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground text-sm px-1.5 py-0.5 rounded transition-colors"
            aria-label={t("common.close", { defaultValue: "Fechar" })}
          >
            ✕
          </button>
        </div>

        <div className="rounded-lg border border-border/20 bg-base/40 p-3.5 space-y-2">
          <p className="text-sm font-medium text-foreground">
            {t("questTimer.modalQuestion", {
              defaultValue: "Deseja iniciar o cronômetro para esta quest?",
            })}
          </p>
          <p className="text-xs text-foreground-muted leading-relaxed">
            {t("questTimer.modalHint", {
              defaultValue:
                "Ao iniciar o cronômetro, o tempo gasto em cada missão será registrado automaticamente quando você marcar o checkbox. Isso é opcional e você pode pausar a qualquer momento.",
            })}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => onConfirm(true)}
            className="ds-btn-primary flex-1 justify-center gap-2 py-2.5 shadow-[0_0_12px_rgba(0,255,102,0.25)]"
          >
            <span>⏱️</span>
            <span>{t("questTimer.startWithTimer", { defaultValue: "Sim, com timer" })}</span>
          </button>

          <button
            type="button"
            onClick={() => onConfirm(false)}
            className="rounded-panel border border-border/30 bg-surface-muted/60 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-surface-muted transition-colors flex-1 justify-center text-center"
          >
            {t("questTimer.startWithoutTimer", { defaultValue: "Iniciar sem timer" })}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-panel px-3 py-2.5 text-xs text-foreground-muted hover:text-foreground transition-colors text-center"
          >
            {t("common.cancel", { defaultValue: "Cancelar" })}
          </button>
        </div>
      </div>
    </div>
  );
}
