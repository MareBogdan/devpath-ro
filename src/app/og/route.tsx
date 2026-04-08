import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "DevPath RO";
  const description =
    searchParams.get("description") ??
    "Platformă de învățare IT & AI pentru studenți români.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
          padding: "72px 80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              background: "rgba(139, 92, 246, 0.25)",
              border: "1px solid rgba(139, 92, 246, 0.5)",
              borderRadius: "999px",
              padding: "8px 20px",
              color: "#c4b5fd",
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            devpath.ro
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: title.length > 40 ? "52px" : "64px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: "900px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#a5b4fc",
              lineHeight: 1.4,
              maxWidth: "820px",
              fontWeight: 400,
            }}
          >
            {description}
          </div>
        </div>

        {/* Footer branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              Dev
            </span>
            <span
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#8b5cf6",
              }}
            >
              Path
            </span>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 400,
                color: "#6b7280",
                marginLeft: "4px",
              }}
            >
              RO
            </span>
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#6b7280",
            }}
          >
            Învață IT &amp; AI în română
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
