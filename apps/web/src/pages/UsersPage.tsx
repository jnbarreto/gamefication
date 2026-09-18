import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import Panel from "@/components/design/Panel";
import { ApiError } from "@/lib/api/client";
import { createUserRequest, fetchUsers } from "@/lib/auth/authApi";
import type { AuthUser, UserRole } from "@/lib/auth/types";

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("PLAYER");
  const [isCreating, setIsCreating] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchUsers();
      setUsers(response.users);
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : loadError instanceof Error
            ? loadError.message
            : t("common.unknownError"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      await createUserRequest({ email, password, displayName, role });
      setEmail("");
      setPassword("");
      setDisplayName("");
      setRole("PLAYER");
      await loadUsers();
    } catch (createError) {
      setError(
        createError instanceof ApiError
          ? createError.message
          : createError instanceof Error
            ? createError.message
            : t("common.unknownError"),
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <Panel title={t("users.title")}>
        {isLoading ? <p className="text-foreground-muted">{t("users.loading")}</p> : null}
        {error ? <p className="text-danger" role="alert">{error}</p> : null}

        {!isLoading ? (
          <div className="overflow-x-auto">
            <table className="users-table">
              <thead>
                <tr>
                  <th>{t("auth.email")}</th>
                  <th>{t("users.displayName")}</th>
                  <th>{t("users.role")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="font-mono text-small">{user.email}</td>
                    <td>{user.displayName}</td>
                    <td className="font-mono text-small">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Panel>

      <Panel title={t("users.createTitle")}>
        <form className="users-form" onSubmit={handleCreate}>
          <label className="users-form__field">
            <span>{t("auth.email")}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="users-form__field">
            <span>{t("users.displayName")}</span>
            <input
              type="text"
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>

          <label className="users-form__field">
            <span>{t("auth.password")}</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <label className="users-form__field">
            <span>{t("users.role")}</span>
            <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="PLAYER">{t("users.rolePlayer")}</option>
              <option value="ADMIN">{t("users.roleAdmin")}</option>
            </select>
          </label>

          <button type="submit" className="users-form__submit" disabled={isCreating}>
            {isCreating ? t("common.creating") : t("users.createAction")}
          </button>
        </form>
      </Panel>
    </div>
  );
}
