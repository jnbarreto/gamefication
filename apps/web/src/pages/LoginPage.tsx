import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import LanguageToggle from "@/components/layout/LanguageToggle";
import ProjectLogo from "@/components/layout/ProjectLogo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { ApiError } from "@/lib/api/client";
import { forgotPasswordRequest, resetPasswordRequest } from "@/lib/auth/authApi";
import { useAuth } from "@/lib/auth/AuthProvider";
import loginBackground from "../../assets/Login.png";

type AuthView = "login" | "register" | "forgot" | "reset";

function readInitialView(): AuthView {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");

  if (view === "register" || view === "forgot" || view === "reset") {
    return view;
  }

  return "login";
}

function readResetToken(): string {
  return new URLSearchParams(window.location.search).get("token") ?? "";
}

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const [view, setView] = useState<AuthView>(readInitialView);
  const resetToken = readResetToken();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (view === "reset" && !resetToken) {
      setError(t("auth.resetTokenMissing"));
    }
  }, [view, resetToken, t]);

  function switchView(nextView: AuthView) {
    setView(nextView);
    setError(null);
    setSuccess(null);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        setError(t("auth.invalidCredentials"));
      } else {
        setError(
          submitError instanceof Error ? submitError.message : t("common.unknownError"),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register(email, password, displayName);
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : submitError instanceof Error
            ? submitError.message
            : t("common.unknownError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const result = await forgotPasswordRequest(email);
      setSuccess(result.message);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : t("common.unknownError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const result = await resetPasswordRequest(resetToken, newPassword);
      setSuccess(result.message);
      setTimeout(() => switchView("login"), 1500);
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : submitError instanceof Error
            ? submitError.message
            : t("common.unknownError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const title =
    view === "register"
      ? t("auth.registerTitle")
      : view === "forgot"
        ? t("auth.forgotTitle")
        : view === "reset"
          ? t("auth.resetTitle")
          : t("auth.title");

  const subtitle =
    view === "register"
      ? t("auth.registerSubtitle")
      : view === "forgot"
        ? t("auth.forgotSubtitle")
        : view === "reset"
          ? t("auth.resetSubtitle")
          : t("auth.subtitle");

  return (
    <div className="login-page">
      <img
        src={loginBackground}
        alt=""
        aria-hidden="true"
        className="login-page__background"
      />
      <div className="login-page__overlay" />

      <div className="login-page__content">
        <header className="login-page__header">
          <ProjectLogo />
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        <section className="login-page__panel ds-panel">
          <h1 className="ds-panel__title">{title}</h1>
          <p className="login-page__subtitle">{subtitle}</p>

          {view === "login" ? (
            <form className="login-page__form" onSubmit={handleLogin}>
              <label className="login-page__field">
                <span className="login-page__label">{t("auth.email")}</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="login-page__input"
                />
              </label>

              <label className="login-page__field">
                <span className="login-page__label">{t("auth.password")}</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="login-page__input"
                />
              </label>

              {error ? <p className="login-page__error" role="alert">{error}</p> : null}

              <button type="submit" className="login-page__submit" disabled={isSubmitting}>
                {isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
              </button>

              <div className="login-page__links">
                <button type="button" className="login-page__link" onClick={() => switchView("forgot")}>
                  {t("auth.forgotLink")}
                </button>
                <button type="button" className="login-page__link" onClick={() => switchView("register")}>
                  {t("auth.registerLink")}
                </button>
              </div>
            </form>
          ) : null}

          {view === "register" ? (
            <form className="login-page__form" onSubmit={handleRegister}>
              <label className="login-page__field">
                <span className="login-page__label">{t("users.displayName")}</span>
                <input
                  type="text"
                  autoComplete="name"
                  required
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="login-page__input"
                />
              </label>

              <label className="login-page__field">
                <span className="login-page__label">{t("auth.email")}</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="login-page__input"
                />
              </label>

              <label className="login-page__field">
                <span className="login-page__label">{t("auth.password")}</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="login-page__input"
                />
              </label>

              {error ? <p className="login-page__error" role="alert">{error}</p> : null}

              <button type="submit" className="login-page__submit" disabled={isSubmitting}>
                {isSubmitting ? t("auth.registering") : t("auth.registerAction")}
              </button>

              <button type="button" className="login-page__link" onClick={() => switchView("login")}>
                {t("auth.backToLogin")}
              </button>
            </form>
          ) : null}

          {view === "forgot" ? (
            <form className="login-page__form" onSubmit={handleForgot}>
              <label className="login-page__field">
                <span className="login-page__label">{t("auth.email")}</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="login-page__input"
                />
              </label>

              {error ? <p className="login-page__error" role="alert">{error}</p> : null}
              {success ? <p className="login-page__success" role="status">{success}</p> : null}

              <button type="submit" className="login-page__submit" disabled={isSubmitting}>
                {isSubmitting ? t("auth.sendingReset") : t("auth.sendReset")}
              </button>

              <button type="button" className="login-page__link" onClick={() => switchView("login")}>
                {t("auth.backToLogin")}
              </button>
            </form>
          ) : null}

          {view === "reset" ? (
            <form className="login-page__form" onSubmit={handleReset}>
              <label className="login-page__field">
                <span className="login-page__label">{t("auth.newPassword")}</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="login-page__input"
                />
              </label>

              {error ? <p className="login-page__error" role="alert">{error}</p> : null}
              {success ? <p className="login-page__success" role="status">{success}</p> : null}

              <button
                type="submit"
                className="login-page__submit"
                disabled={isSubmitting || !resetToken}
              >
                {isSubmitting ? t("auth.resetting") : t("auth.resetAction")}
              </button>

              <button type="button" className="login-page__link" onClick={() => switchView("login")}>
                {t("auth.backToLogin")}
              </button>
            </form>
          ) : null}
        </section>
      </div>
    </div>
  );
}
