import { useId } from "react";
import { countries, regionsFor } from "../../data/demo/regions";
import type { AddressDraft, FieldErrors } from "../../types/commerce";

type AddressFieldsProps = {
  value: AddressDraft;
  errors: FieldErrors;
  errorPrefix?: string;
  idPrefix: string;
  onChange: (next: AddressDraft) => void;
};

export function AddressFields({ value, errors, errorPrefix = "", idPrefix, onChange }: AddressFieldsProps) {
  const baseId = useId();
  const regions = regionsFor(value.country);
  const errorFor = (name: string) => errors[errorPrefix ? `${errorPrefix}.${name}` : name];
  const errorId = (name: string) => `${baseId}-${name}-error`;

  const update = (patch: Partial<AddressDraft>) => {
    const next = { ...value, ...patch };
    if (patch.country && patch.country !== value.country) {
      const nextRegions = regionsFor(patch.country);
      if (!nextRegions || !nextRegions.some((region) => region.code === next.state)) {
        next.state = "";
      }
    }
    onChange(next);
  };

  return (
    <div className="address-fields">
      <div className="field-row">
        <TextField
          id={`${idPrefix}-first`}
          label="First name"
          autoComplete="given-name"
          value={value.firstName}
          error={errorFor("firstName")}
          errorId={errorId("firstName")}
          onChange={(firstName) => update({ firstName })}
        />
        <TextField
          id={`${idPrefix}-last`}
          label="Last name"
          autoComplete="family-name"
          value={value.lastName}
          error={errorFor("lastName")}
          errorId={errorId("lastName")}
          onChange={(lastName) => update({ lastName })}
        />
      </div>
      <TextField
        id={`${idPrefix}-company`}
        label="Company (optional)"
        autoComplete="organization"
        value={value.company}
        error={errorFor("company")}
        errorId={errorId("company")}
        onChange={(company) => update({ company })}
      />
      <TextField
        id={`${idPrefix}-address1`}
        label="Street address"
        autoComplete="address-line1"
        value={value.address1}
        error={errorFor("address1")}
        errorId={errorId("address1")}
        onChange={(address1) => update({ address1 })}
      />
      <TextField
        id={`${idPrefix}-address2`}
        label="Apartment or suite (optional)"
        autoComplete="address-line2"
        value={value.address2}
        error={errorFor("address2")}
        errorId={errorId("address2")}
        onChange={(address2) => update({ address2 })}
      />
      <div className="field-row">
        <TextField
          id={`${idPrefix}-city`}
          label="City"
          autoComplete="address-level2"
          value={value.city}
          error={errorFor("city")}
          errorId={errorId("city")}
          onChange={(city) => update({ city })}
        />
        <div className="field">
          <label htmlFor={`${idPrefix}-country`}>Country</label>
          <select
            id={`${idPrefix}-country`}
            autoComplete="country"
            value={value.country}
            aria-invalid={errorFor("country") ? true : undefined}
            aria-describedby={errorFor("country") ? errorId("country") : undefined}
            onChange={(event) => update({ country: event.target.value })}
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errorFor("country") ? (
            <p className="field-error" id={errorId("country")}>
              {errorFor("country")}
            </p>
          ) : null}
          {value.country === "PR" ? (
            <p className="field-hint">Puerto Rico is selected as the country, matching the current store’s shipping note.</p>
          ) : null}
        </div>
      </div>
      <div className="field-row">
        {regions && regions.length > 0 ? (
          <div className="field">
            <label htmlFor={`${idPrefix}-state`}>{value.country === "CA" ? "Province" : "State"}</label>
            <select
              id={`${idPrefix}-state`}
              autoComplete="address-level1"
              value={value.state}
              aria-invalid={errorFor("state") ? true : undefined}
              aria-describedby={errorFor("state") ? errorId("state") : undefined}
              onChange={(event) => update({ state: event.target.value })}
            >
              <option value="">Choose</option>
              {regions.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
            {errorFor("state") ? (
              <p className="field-error" id={errorId("state")}>
                {errorFor("state")}
              </p>
            ) : null}
          </div>
        ) : regions === null ? (
          <TextField
            id={`${idPrefix}-state`}
            label="State or province (if used)"
            autoComplete="address-level1"
            value={value.state}
            error={errorFor("state")}
            errorId={errorId("state")}
            onChange={(state) => update({ state })}
          />
        ) : null}
        <TextField
          id={`${idPrefix}-postcode`}
          label="Postal code"
          autoComplete="postal-code"
          value={value.postcode}
          error={errorFor("postcode")}
          errorId={errorId("postcode")}
          onChange={(postcode) => update({ postcode })}
        />
      </div>
      <TextField
        id={`${idPrefix}-phone`}
        label="Phone (optional)"
        autoComplete="tel"
        value={value.phone}
        error={errorFor("phone")}
        errorId={errorId("phone")}
        onChange={(phone) => update({ phone })}
      />
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  errorId,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  errorId: string;
  autoComplete: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
