import { FormEvent, useState } from "react";
import { useCommerce } from "../../context/CommerceContext";
import { authService } from "../../services/auth/demoAuth";
import { AccountLayout } from "./AccountLayout";
import { PasswordField } from "./PasswordField";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AccountDetailsPage() {
  const { profile, updateProfile } = useCommerce();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);
  const [profileError, setProfileError] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");

  const onProfile = (event: FormEvent) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setProfileError("Enter a first and last name.");
      setProfileStatus("");
      return;
    }
    if (!emailPattern.test(email.trim())) {
      setProfileError("Enter a valid email address.");
      setProfileStatus("");
      return;
    }
    updateProfile({ firstName, lastName, email });
    setProfileError("");
    setProfileStatus("Account details saved.");
  };

  const onPassword = (event: FormEvent) => {
    event.preventDefault();
    const result = authService.previewPasswordChange({ password, confirmPassword });
    if (!result.ok) {
      setPasswordError(result.fieldErrors?.password ?? "");
      setConfirmError(result.fieldErrors?.confirmPassword ?? "");
      setPasswordStatus("");
      return;
    }
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setConfirmError("");
    setPasswordStatus("Password updated.");
  };

  return (
    <AccountLayout path="/account/details" title="Account details">
      <section className="commerce-card">
        <h2>Profile</h2>
        <form className="stack-form" onSubmit={onProfile} noValidate>
          {profileError ? (
            <p className="commerce-alert" role="alert">
              {profileError}
            </p>
          ) : null}
          {profileStatus ? (
            <p className="commerce-status" role="status">
              {profileStatus}
            </p>
          ) : null}
          <div className="field-row">
            <div className="field">
              <label htmlFor="account-first">First name</label>
              <input id="account-first" value={firstName} autoComplete="given-name" onChange={(event) => setFirstName(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="account-last">Last name</label>
              <input id="account-last" value={lastName} autoComplete="family-name" onChange={(event) => setLastName(event.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="account-email">Email</label>
            <input id="account-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <button className="btn" type="submit">
            Save profile
          </button>
        </form>
      </section>
      <section className="commerce-card">
        <h2>Change password</h2>
        <form className="stack-form" onSubmit={onPassword} noValidate>
          {passwordStatus ? (
            <p className="commerce-status" role="status">
              {passwordStatus}
            </p>
          ) : null}
          <PasswordField
            label="New password"
            name="new-password"
            autoComplete="new-password"
            value={password}
            error={passwordError}
            onChange={setPassword}
          />
          <PasswordField
            label="Confirm new password"
            name="confirm-password"
            autoComplete="new-password"
            value={confirmPassword}
            error={confirmError}
            onChange={setConfirmPassword}
          />
          <button className="btn btn-secondary" type="submit">
            Review password change
          </button>
        </form>
      </section>
    </AccountLayout>
  );
}
