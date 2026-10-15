import { FormEvent, useId, useState } from "react";
import { shopSearchHref } from "../lib/format";
import { IconSearch } from "./Icons";

type SearchFormProps = {
  id: string;
  autoFocus?: boolean;
  variant?: "hero" | "overlay";
};

export function SearchForm({ id, autoFocus = false, variant = "hero" }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const errorId = useId();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = query.trim();
    if (!next) {
      setError("Enter a part name, keyword, model, or part number.");
      return;
    }
    window.location.assign(shopSearchHref(next));
  };

  return (
    <form className={`search-form search-form-${variant}`} role="search" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor={id}>
        Search Suzuki parts
      </label>
      <input
        id={id}
        type="search"
        name="s"
        value={query}
        autoFocus={autoFocus}
        autoComplete="off"
        placeholder="Search by part number, keyword, or model..."
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => {
          setQuery(event.target.value);
          if (error) {
            setError("");
          }
        }}
      />
      <button type="submit">
        <IconSearch />
        <span>Search</span>
      </button>
      {error ? (
        <p id={errorId} className="search-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
