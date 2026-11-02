import { ImageResponse } from "next/og";

export const alt = "SolWatch, a read-only Solana wallet tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#10140f",
          color: "#f3f0e6",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 28, color: "#d6ff4a" }}>
          SolWatch
        </div>
        <div style={{ display: "flex", fontSize: 72, lineHeight: 1.05, letterSpacing: -2 }}>
          A read-only Solana wallet tracker.
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#a3aa98" }}>
          Balances, tokens, and recent activity. No keys. No signing.
        </div>
      </div>
    ),
    { ...size },
  );
}
