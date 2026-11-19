import { ImageResponse } from "next/og";

export const alt = "GoDiand — Ojek, antar, makan di Banda Aceh";
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
          position: "relative",
          overflow: "hidden",
          background: "#DCEFFB",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 380,
            height: 380,
            borderRadius: 999,
            background: "#FFC531",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 120,
            bottom: -160,
            width: 320,
            height: 320,
            borderRadius: 999,
            background: "#B7E0F7",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: 64,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: 18,
                background: "#0A78B5",
                border: "3px solid #0B1C26",
                color: "#FFFFFF",
                fontSize: 34,
                fontWeight: 800,
              }}
            >
              G
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 32,
                fontWeight: 800,
                color: "#0B1C26",
              }}
            >
              GoDiand
            </div>
            <div
              style={{
                display: "flex",
                marginLeft: "auto",
                border: "2px solid #0B1C26",
                borderRadius: 999,
                background: "#FFFFFF",
                padding: "8px 20px",
                fontSize: 22,
                fontWeight: 700,
                color: "#0B1C26",
              }}
            >
              Banda Aceh
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 76,
                fontWeight: 800,
                lineHeight: 1.05,
                color: "#0B1C26",
                maxWidth: 900,
              }}
            >
              <div style={{ display: "flex" }}>Ojek, antar, makan.</div>
              <div style={{ display: "flex" }}>
                Semua sat-set di Banda Aceh.
              </div>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 26,
                fontSize: 26,
                color: "#2A4450",
              }}
            >
              Driver lokal · Tarif jelas · Tunai atau QRIS · Chat & SOS
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {["6 layanan", "Mulai Rp9.000", "Bayar di tempat"].map((chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  border: "2px solid #0B1C26",
                  borderRadius: 999,
                  background: "#FFFFFF",
                  padding: "8px 20px",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#0B1C26",
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
