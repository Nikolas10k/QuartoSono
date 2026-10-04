import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#262626",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ width: 22, height: 22, borderRadius: 11, background: "#F5F2EC", alignSelf: "flex-start", marginLeft: 38 }} />
        <div style={{ width: 104, height: 24, borderRadius: 5, background: "#F5F2EC" }} />
        <div style={{ width: 104, height: 18, borderRadius: 4, background: "#BFB5A7" }} />
      </div>
    ),
    size,
  );
}
