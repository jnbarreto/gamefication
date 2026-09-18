import { useEffect } from "react";
import { useTranslation } from "react-i18next";

type SkillDescriptionModalProps = {
  name: string;
  description: string;
  open: boolean;
  onClose: () => void;
};

export default function SkillDescriptionModal({
  name,
  description,
  open,
  onClose,
}: SkillDescriptionModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="ds-modal" role="presentation" onClick={onClose}>
      <div
        className="ds-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-description-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ds-modal__head">
          <h3 id="skill-description-title" className="ds-modal__title">
            {name}
          </h3>
          <button type="button" className="ds-modal__close ds-focus" onClick={onClose}>
            {t("common.close")}
          </button>
        </div>
        <p className="ds-modal__body">{description}</p>
      </div>
    </div>
  );
}
