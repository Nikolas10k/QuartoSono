import { ImageResponse } from "next/og";

export const alt = "Quarto Sono Colchões — 20 anos cuidando do seu sono";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const cols = ["#E6DFD5", "#F5F2EC", "#BFB5A7", "#F5F2EC"];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#F5F2EC" }}>
        {cols.map((c, i) => (
          <div
            key={i}
            style={{
              width: i === 2 ? "40%" : "20%",
              height: "100%",
              background: c,
              borderRight: "1px solid rgba(38,38,38,0.12)",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 80px",
            color: "#262626",
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: 5, textTransform: "uppercase", color: "#8A8177", marginBottom: 28 }}>
            Quarto Sono Colchões · Brasília — DF
          </div>
          <div style={{ fontSize: 108, lineHeight: 0.95, letterSpacing: -4, fontWeight: 600, textTransform: "uppercase" }}>
            20 anos cuidando
          </div>
          <div style={{ fontSize: 108, lineHeight: 0.95, letterSpacing: -4, fontWeight: 600, textTransform: "uppercase" }}>
            do seu sono.
          </div>
          <div style={{ fontSize: 24, marginTop: 36, color: "#262626" }}>
            Colchões · Conjuntos Box · Camas · Cabeceiras · Sofás
          </div>
        </div>
      </div>
    ),
    size,
  );
}
