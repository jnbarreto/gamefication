import { useState } from "react";
import { useTranslation } from "react-i18next";

import AvatarPicker from "@/components/character/AvatarPicker";
import { useAvatar } from "@/lib/avatars/useAvatar";

type CharacterPortraitSlotProps = {
  name: string;
  imageSrc?: string | null;
};

export default function CharacterPortraitSlot({
  name,
  imageSrc,
}: CharacterPortraitSlotProps) {
  const { avatarSrc } = useAvatar();
  const resolvedImageSrc = imageSrc ?? avatarSrc;
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);

  if (resolvedImageSrc) {
    return (
      <>
        <button
          type="button"
          className="ds-character-portrait ds-character-portrait--interactive group ds-focus"
          onClick={() => setPickerOpen(true)}
          aria-label={t("character.changeAvatar")}
        >
          <img
            src={resolvedImageSrc}
            alt={name}
            className="ds-character-portrait__image"
          />
          <span className="ds-character-portrait__overlay">
            {t("character.changeAvatar")}
          </span>
        </button>

        <AvatarPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className="ds-character-portrait ds-character-portrait--empty ds-character-portrait--interactive group ds-focus"
        onClick={() => setPickerOpen(true)}
        aria-label={t("character.changeAvatar")}
      >
        <span className="ds-character-portrait__glyph" aria-hidden="true">◆</span>
        <span className="ds-character-portrait__overlay">
          {t("character.changeAvatar")}
        </span>
      </button>

      <AvatarPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  );
}
