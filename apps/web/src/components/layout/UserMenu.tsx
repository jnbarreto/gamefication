import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import UserAvatar from "@/components/layout/UserAvatar";
import { ApiError } from "@/lib/api/client";
import { resetCharacterProgress } from "@/lib/api/character";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useConfirm } from "@/lib/confirm/ConfirmDialogProvider";

export default function UserMenu() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const { confirm } = useConfirm();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  if (!user) {
    return null;
  }

  async function handleResetProgress() {
    const confirmed = await confirm({
      title: t("auth.resetProgress"),
      message: t("auth.resetProgressConfirm"),
      confirmLabel: t("auth.resetProgress"),
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    setError(null);
    setResetting(true);

    try {
      await resetCharacterProgress();
      setOpen(false);
      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : t("auth.resetProgressFailed"));
    } finally {
      setResetting(false);
    }
  }

  const roleLabel = t(`users.role${user.role === "ADMIN" ? "Admin" : "Player"}`);

  return (
    <div ref={containerRef} className="ds-user-menu">
      <button
        type="button"
        className="ds-user-menu__avatar-trigger ds-focus"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("layout.userMenu", { name: user.displayName })}
      >
        <UserAvatar name={user.displayName} />
      </button>

      {open && (
        <div className="ds-user-menu__panel" role="menu">
          <p className="ds-user-menu__panel-heading">
            {user.displayName}
            <span className="ds-user-menu__role"> · {roleLabel}</span>
          </p>

          {error && <p className="ds-user-menu__error">{error}</p>}

          <button
            type="button"
            role="menuitem"
            className="ds-user-menu__item ds-focus"
            onClick={() => void handleResetProgress()}
            disabled={resetting}
          >
            {resetting ? t("auth.resettingProgress") : t("auth.resetProgress")}
          </button>

          <button
            type="button"
            role="menuitem"
            className="ds-user-menu__item ds-user-menu__item--danger ds-focus"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            {t("auth.logout")}
          </button>
        </div>
      )}
    </div>
  );
}
