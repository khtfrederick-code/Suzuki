import { FormEvent, useState } from "react";
import { useCommerce } from "../../context/CommerceContext";
import { Breadcrumbs } from "../shop/Breadcrumbs";
import { PasswordField } from "./PasswordField";
import { usePageTitle } from "./usePageTitle";

export function LoginPage() {
  usePageTitle("Sign In | Suzuki Parts USA");
  const { session, authBusy, signIn } = useCommerce();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextUsername = username.trim() ? "" : "Enter your username or email address.";
    const nextPassword = password ? "" : "Enter your password.";
    setUsernameError(nextUsername);
    setPasswordError(nextPassword);
    setFormError("");
    if (nextUsername || nextPassword) {
      return;
    }
    const result = await signIn({ username, password, remember });
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    window.location.assign("/account");
  };

  return (
    <div className="catalog-page">
      <div className="container auth-shell">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sign In" }]} />
        <div className="auth-card">
          <h1>Sign In</h1>
          {session ? (
            <p className="commerce-status" role="status">
              You are already signed in. <a href="/account">Go to My Account</a>
            </p>
          ) : null}
          <form className="stack-form" onSubmit={onSubmit} noValidate>
            {formError ? (
              <p className="commerce-alert" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="field">
              <label htmlFor="login-username">Username or email address</label>
              <input
                id="login-username"
                name="username"
                autoComplete="username"
                value={username}
                aria-invalid={usernameError ? true : undefined}
                aria-describedby={usernameError ? "login-username-error" : undefined}
                onChange={(event) => setUsername(event.target.value)}
              />
              {usernameError ? (
                <p className="field-error" id="login-username-error">
                  {usernameError}
                </p>
              ) : null}
            </div>
            <PasswordField
              label="Password"
              name="password"
              autoComplete="current-password"
              value={password}
              error={passwordError}
              onChange={setPassword}
            />
            <label className="check-line">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              <span>Remember me</span>
            </label>
            <button className="btn btn-block" type="submit" disabled={authBusy}>
              {authBusy ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <p className="auth-links">
            <a href="/forgot-password">Lost your password?</a>
            <a href="/register">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
}
