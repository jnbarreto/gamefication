import { useAvatar } from "@/lib/avatars/useAvatar";

type UserAvatarProps = {
  name: string;
  imageSrc?: string | null;
  size?: "sm" | "md";
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function UserAvatar({
  name,
  imageSrc,
  size = "md",
}: UserAvatarProps) {
  const { avatarSrc } = useAvatar();
  const resolvedImageSrc = imageSrc ?? avatarSrc;
  const dimension = size === "sm" ? "h-8 w-8 text-micro" : "h-10 w-10 text-small";

  if (resolvedImageSrc) {
    return (
      <img
        src={resolvedImageSrc}
        alt={name}
        className={`ds-user-avatar ds-user-avatar--image ${dimension}`}
      />
    );
  }

  return (
    <span
      className={`ds-user-avatar ds-user-avatar--initials ${dimension}`}
      aria-hidden="true"
    >
      {initialsFromName(name)}
    </span>
  );
}
