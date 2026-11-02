"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { parseAddress } from "@/lib/address";

const EXAMPLES = [
  "4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF",
  "Vote111111111111111111111111111111111111111",
];

export function AddressSearch({ initialValue = "" }: { initialValue?: string }) {
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  function submit(next: string) {
    const parsed = parseAddress(next);
    if (!parsed) {
      setError("Enter a valid Solana address.");
      return;
    }
    setError(null);
    router.push(`/wallet/${parsed}`);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(value);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      <label htmlFor={inputId} className="text-sm font-medium text-muted">
        Solana address
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={inputId}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          placeholder="Paste a public address"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 rounded-full border border-border bg-surface px-5 py-3 font-mono text-sm text-foreground outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast"
        >
          Search
        </button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setValue(example);
              submit(example);
            }}
            className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted hover:text-foreground"
          >
            {example.slice(0, 4)}…{example.slice(-4)}
          </button>
        ))}
      </div>
    </form>
  );
}
