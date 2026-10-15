import { FormEvent } from "react";
import { IconClose, IconSearch } from "../Icons";

type FAQSearchProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

export function FAQSearch({ id, value, onChange }: FAQSearchProps) {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <form className="faq-search" role="search" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor={id}>
        Search questions and answers
      </label>
      <IconSearch />
      <input
        id={id}
        type="search"
        value={value}
        autoComplete="off"
        placeholder="Search questions and answers..."
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button type="button" className="faq-search-clear" onClick={() => onChange("")}>
          <span className="sr-only">Clear FAQ search</span>
          <IconClose />
        </button>
      ) : null}
    </form>
  );
}
