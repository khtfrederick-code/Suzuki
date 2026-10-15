import { FormEvent, useState } from "react";
import { Breadcrumbs } from "../shop/Breadcrumbs";
import { usePageTitle } from "./usePageTitle";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage() {
  usePageTitle("Lost Password | Suzuki Parts USA");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Enter a username or email address.");
      setDone(false);
      return;
    }
    if (trimmed.includes("@") && !emailPattern.test(trimmed)) {
      setError("Enter a valid email address, or a username without @.");
      setDone(false);
      return;
    }
    setError("");
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setDone(true);
    }, 200);
  };

  return (
    <div className="catalog-page">
      <div className="container auth-shell">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sign In", href: "/login" }, { label: "Lost Password" }]} />
        <div className="auth-card">
          <h1>Lost your password?</h1>
          {done ? (
            <p className="commerce-status" role="status">
              Your reset request was received.
            </p>
          ) : null}
          <form className="stack-form" onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="lost-user">Username or email</label>
              <input
                id="lost-user"
                autoComplete="username"
                value={value}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "lost-user-error" : undefined}
                onChange={(event) => {
                  setValue(event.target.value);
                  setError("");
                  setDone(false);
                }}
              />
              {error ? (
                <p className="field-error" id="lost-user-error">
                  {error}
                </p>
              ) : null}
            </div>
            <button className="btn btn-block" type="submit" disabled={busy}>
              {busy ? "Checking…" : "Reset password"}
            </button>
          </form>
          <p className="auth-links">
            <a href="/login">Back to Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
}
