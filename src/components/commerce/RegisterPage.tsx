import { FormEvent, useState } from "react";
import type { RegisterInput } from "../../types/commerce";
import { Breadcrumbs } from "../shop/Breadcrumbs";
import { PasswordField } from "./PasswordField";
import { usePageTitle } from "./usePageTitle";

const empty: RegisterInput = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  usePageTitle("Create Account | Suzuki Parts USA");
  const [form, setForm] = useState<RegisterInput>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const update = (key: keyof RegisterInput, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setDone(false);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Partial<Record<keyof RegisterInput, string>> = {};
    if (!form.firstName.trim()) next.firstName = "Enter a first name.";
    if (!form.lastName.trim()) next.lastName = "Enter a last name.";
    if (!emailPattern.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (form.password !== form.confirmPassword) next.confirmPassword = "Those passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setFormError("Check the highlighted fields.");
      setDone(false);
      return;
    }
    setBusy(true);
    setFormError("");
    window.setTimeout(() => {
      setBusy(false);
      setDone(true);
      setForm((current) => ({ ...current, password: "", confirmPassword: "" }));
    }, 200);
  };

  return (
    <div className="catalog-page">
      <div className="container auth-shell">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Create Account" }]} />
        <div className="auth-card">
          <h1>Create Account</h1>
          {done ? (
            <p className="commerce-status" role="status">
              Account created. <a href="/login">Sign in</a>
            </p>
          ) : null}
          <form className="stack-form" onSubmit={onSubmit} noValidate>
            {formError ? (
              <p className="commerce-alert" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="field-row">
              <div className="field">
                <label htmlFor="register-first">First name</label>
                <input
                  id="register-first"
                  autoComplete="given-name"
                  value={form.firstName}
                  aria-invalid={errors.firstName ? true : undefined}
                  onChange={(event) => update("firstName", event.target.value)}
                />
                {errors.firstName ? <p className="field-error">{errors.firstName}</p> : null}
              </div>
              <div className="field">
                <label htmlFor="register-last">Last name</label>
                <input
                  id="register-last"
                  autoComplete="family-name"
                  value={form.lastName}
                  aria-invalid={errors.lastName ? true : undefined}
                  onChange={(event) => update("lastName", event.target.value)}
                />
                {errors.lastName ? <p className="field-error">{errors.lastName}</p> : null}
              </div>
            </div>
            <div className="field">
              <label htmlFor="register-email">Email address</label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={form.email}
                aria-invalid={errors.email ? true : undefined}
                onChange={(event) => update("email", event.target.value)}
              />
              {errors.email ? <p className="field-error">{errors.email}</p> : null}
            </div>
            <PasswordField
              label="Password"
              name="new-password"
              autoComplete="new-password"
              value={form.password}
              error={errors.password}
              onChange={(value) => update("password", value)}
            />
            <p className="field-hint">Use at least 8 characters.</p>
            <PasswordField
              label="Confirm password"
              name="confirm-password"
              autoComplete="new-password"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={(value) => update("confirmPassword", value)}
            />
            <button className="btn btn-block" type="submit" disabled={busy}>
              {busy ? "Checking…" : "Create Account"}
            </button>
          </form>
          <p className="auth-links">
            <a href="/login">Already registered? Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
