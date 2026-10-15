import { useId, useState } from "react";

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete: string;
  name: string;
};

export function PasswordField({ label, value, onChange, error, autoComplete, name }: PasswordFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-field">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" onClick={() => setVisible((current) => !current)} aria-pressed={visible}>
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error ? (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
