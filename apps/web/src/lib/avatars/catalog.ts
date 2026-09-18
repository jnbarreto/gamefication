export type AvatarOption = {
  id: string;
  label: string;
  src: string;
};

const avatarModules = import.meta.glob<string>("../../../assets/avatar/*.{jpeg,jpg,png}", {
  eager: true,
  import: "default",
});

function avatarIdFromPath(path: string): string {
  const fileName = path.split("/").pop() ?? path;

  return fileName.replace(/\.(jpe?g|png)$/i, "");
}

function avatarLabelFromId(id: string): string {
  const base = id.replace(/_default$/i, "");

  return base.charAt(0).toUpperCase() + base.slice(1);
}

export const AVATAR_OPTIONS: AvatarOption[] = Object.entries(avatarModules)
  .map(([path, src]) => {
    const id = avatarIdFromPath(path);

    return {
      id,
      label: avatarLabelFromId(id),
      src,
    };
  })
  .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));

export const DEFAULT_AVATAR_ID = AVATAR_OPTIONS[0]?.id ?? "";

export function getAvatarById(id: string): AvatarOption | undefined {
  return AVATAR_OPTIONS.find((option) => option.id === id);
}

export function resolveAvatarSrc(id: string | null | undefined): string | null {
  if (!id) {
    return AVATAR_OPTIONS[0]?.src ?? null;
  }

  return getAvatarById(id)?.src ?? AVATAR_OPTIONS[0]?.src ?? null;
}
