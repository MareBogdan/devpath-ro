import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Hr,
  Preview,
  Section,
} from "@react-email/components";

interface WeeklyProgressEmailProps {
  name: string;
  lessonsCompletedThisWeek: number;
  totalXP: number;
  currentLevel: number;
  levelName: string;
  streakCount: number;
  siteUrl: string;
}

export function WeeklyProgressEmail({
  name,
  lessonsCompletedThisWeek,
  totalXP,
  currentLevel,
  levelName,
  streakCount,
  siteUrl,
}: WeeklyProgressEmailProps) {
  return (
    <Html lang="ro">
      <Head />
      <Preview>{`Săptămâna ta pe DevPath RO — ${lessonsCompletedThisWeek} lecții completate`}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>DevPath RO 🧠</Heading>
          <Text style={subheadingStyle}>Raportul tău săptămânal</Text>

          <Text style={textStyle}>Salut, {name}!</Text>
          <Text style={textStyle}>
            Iată cum a arătat săptămâna ta pe DevPath RO:
          </Text>

          <Section style={statsContainerStyle}>
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  <td style={statBoxStyle}>
                    <Text style={statNumberStyle}>{lessonsCompletedThisWeek}</Text>
                    <Text style={statLabelStyle}>lecții completate</Text>
                  </td>
                  <td style={statBoxStyle}>
                    <Text style={statNumberStyle}>{totalXP.toLocaleString("ro-RO")}</Text>
                    <Text style={statLabelStyle}>XP total</Text>
                  </td>
                  <td style={statBoxStyle}>
                    <Text style={statNumberStyle}>{streakCount}</Text>
                    <Text style={statLabelStyle}>zile streak</Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Text style={textStyle}>
            Ești la <strong>Nivelul {currentLevel} — {levelName}</strong>. Continuă
            să înveți pentru a avansa!
          </Text>

          <Button href={`${siteUrl}/dashboard`} style={buttonStyle}>
            Continuă să înveți →
          </Button>

          <Hr style={hrStyle} />
          <Text style={footerStyle}>
            DevPath RO · Platforma ta de AI în română ·{" "}
            <a href={`${siteUrl}/settings/notifications`} style={linkStyle}>
              Dezabonare
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#0f0f0f",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "40px 24px",
};

const headingStyle: React.CSSProperties = {
  color: "#a78bfa",
  fontSize: "24px",
  fontWeight: "700",
  marginBottom: "4px",
};

const subheadingStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "14px",
  marginTop: "0",
  marginBottom: "32px",
};

const textStyle: React.CSSProperties = {
  color: "#e5e7eb",
  fontSize: "15px",
  lineHeight: "1.6",
};

const statsContainerStyle: React.CSSProperties = {
  backgroundColor: "#1a1a2e",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
};

const statBoxStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "0 12px",
};

const statNumberStyle: React.CSSProperties = {
  color: "#a78bfa",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
};

const statLabelStyle: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "4px 0 0",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#7c3aed",
  color: "#ffffff",
  borderRadius: "8px",
  padding: "12px 24px",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  marginTop: "8px",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#27272a",
  margin: "32px 0 16px",
};

const footerStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "12px",
};

const linkStyle: React.CSSProperties = {
  color: "#6b7280",
};
