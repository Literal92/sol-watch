"use client";

import { useState } from "react";

export function TokenIcon({ src, symbol }: { src: string | null; symbol: string }) {
  const [failed, setFailed] = useState(false);
  const letters = symbol.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "??";

  if (!src || failed) {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-[10px] font-semibold">
        {letters}
      </span>
    );
  }

  return (
    // Token logos come from arbitrary metadata hosts, so next/image cannot allowlist them.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={32}
      height={32}
      className="h-8 w-8 shrink-0 rounded-full bg-surface-2 object-cover"
      onError={() => setFailed(true)}
    />
  );
}
