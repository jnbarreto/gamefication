import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "default",
  confirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !confirming) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [confirming, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="ds-modal" role="presentation" onClick={confirming ? undefined : onCancel}>
      <div
        className="ds-modal__panel ds-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ds-modal__head">
          <h3 id="confirm-dialog-title" className="ds-modal__title">
            {title ?? t("common.confirm")}
          </h3>
          <button
            type="button"
            className="ds-modal__close ds-focus"
            onClick={onCancel}
            disabled={confirming}
          >
            {t("common.close")}
          </button>
        </div>

        <p id="confirm-dialog-message" className="ds-modal__body">
          {message}
        </p>

        <div className="ds-confirm-dialog__actions">
          <button
            type="button"
            className="ds-skill-create-modal__cancel ds-focus"
            onClick={onCancel}
            disabled={confirming}
          >
            {cancelLabel ?? t("common.cancel")}
          </button>
          <button
            type="button"
            className={
              variant === "danger"
                ? "ds-confirm-dialog__confirm--danger ds-focus"
                : "ds-btn-primary-compact"
            }
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirmLabel ?? t("common.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
