import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useAvatar } from "@/lib/avatars/useAvatar";

type AvatarPickerProps = {
  open: boolean;
  onClose: () => void;
};

export default function AvatarPicker({ open, onClose }: AvatarPickerProps) {
  const { t } = useTranslation();
  const { avatarId, avatars, setAvatarId } = useAvatar();

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
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="ds-modal" role="presentation" onClick={onClose}>
      <div
        className="ds-modal__panel ds-avatar-picker-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ds-modal__head">
          <h2 id="avatar-picker-title" className="ds-modal__title">
            {t("character.chooseAvatar")}
          </h2>
          <button
            type="button"
            className="ds-modal__close ds-focus"
            onClick={onClose}
            aria-label={t("common.close")}
          >
            ×
          </button>
        </header>

        <div
          className="ds-avatar-picker__grid"
          role="listbox"
          aria-label={t("character.chooseAvatar")}
        >
          {avatars.map((avatar) => {
            const selected = avatar.id === avatarId;

            return (
              <button
                key={avatar.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={`ds-avatar-picker__option ds-focus${selected ? " ds-avatar-picker__option--selected" : ""}`}
                onClick={() => {
                  setAvatarId(avatar.id);
                  onClose();
                }}
                title={avatar.label}
              >
                <img
                  src={avatar.src}
                  alt={t("character.avatarOption", { name: avatar.label })}
                  className="ds-avatar-picker__image"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
