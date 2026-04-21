import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #0f766e, #0d9488)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* nuqta */}
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.9)", marginBottom: 1 }} />
        {/* I harfi */}
        <div style={{ color: "white", fontSize: 16, fontWeight: 900, lineHeight: 1, fontFamily: "sans-serif" }}>
          I
        </div>
      </div>
    ),
    { ...size }
  );
}
