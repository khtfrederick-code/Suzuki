import { FormEvent, useState } from "react";
import { authService } from "../../services/auth/demoAuth";
import { Breadcrumbs } from "../shop/Breadcrumbs";
import { PasswordField } from "./PasswordField";
import { usePageTitle } from "./usePageTitle";

export function ResetPasswordPage() {
  usePageTitle("Reset Password | Suzuki Parts USA");
  const preview = new URLSearchParams(window.location.search).get("preview");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(preview === "complete");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    window.setTimeout(() => {
      const result = authService.previewPasswordChange({ password, confirmPassword });
      setBusy(false);
      if (!result.ok) {
        setErrors({
          password: result.fieldErrors?.password,
          confirmPassword: result.fieldErrors?.confirmPassword,
        });
        setDone(false);
        return;
      }
      setPassword("");
      setConfirmPassword("");
      setErrors({});
      setDone(true);
    }, 200);
  };

  return (
    <div className="catalog-page">
      <div className="container auth-shell">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Sign In", href: "/login" }, { label: "Reset Password" }]}
        />
        <div className="auth-card">
          <h1>Reset password</h1>
          {preview === "invalid" ? (
            <div className="commerce-alert" role="alert">
              <p>This reset link is not valid.</p>
              <p>
                <a href="/forgot-password">Request a new reset link</a>
              </p>
            </div>
          ) : null}
          {preview === "expired" ? (
            <div className="commerce-alert" role="alert">
              <p>This reset link has expired.</p>
              <p>
                <a href="/forgot-password">Request a new reset link</a>
              </p>
            </div>
          ) : null}
          {preview === "invalid" || preview === "expired" ? null : (
            <>
              {done ? (
                <p className="commerce-status" role="status">
                  Your password has been updated. <a href="/login">Sign in</a>
                </p>
              ) : (
                <form className="stack-form" onSubmit={onSubmit} noValidate>
                  <p className="field-hint">Use at least 8 characters.</p>
                  <PasswordField
                    label="New password"
                    name="new-password"
                    autoComplete="new-password"
                    value={password}
                    error={errors.password}
                    onChange={setPassword}
                  />
                  <PasswordField
                    label="Confirm new password"
                    name="confirm-password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    error={errors.confirmPassword}
                    onChange={setConfirmPassword}
                  />
                  <button className="btn btn-block" type="submit" disabled={busy}>
                    {busy ? "Saving…" : "Save password"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
