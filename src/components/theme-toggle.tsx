"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "solwatch-theme";
const CHANGE = "solwatch-theme";

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE, onChange);
  return () => window.removeEventListener(CHANGE, onChange);
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => true,
  );

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    window.dispatchEvent(new Event(CHANGE));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      className="rounded-full border border-border px-3 py-2 text-sm text-foreground"
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}
