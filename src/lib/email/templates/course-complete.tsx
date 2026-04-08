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

interface CourseCompleteEmailProps {
  name: string;
  courseTitle: string;
  totalXP: number;
  currentLevel: number;
  levelName: string;
  siteUrl: string;
}

export function CourseCompleteEmail({
  name,
  courseTitle,
  totalXP,
  currentLevel,
  levelName,
  siteUrl,
}: CourseCompleteEmailProps) {
  return (
    <Html lang="ro">
      <Head />
      <Preview>Felicitări! Ai finalizat cursul {courseTitle} 🎉</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>DevPath RO 🧠</Heading>

          <Text style={emojiStyle}>🎉</Text>

          <Text style={bigTextStyle}>Felicitări, {name}!</Text>
          <Text style={textStyle}>
            Ai finalizat cursul{" "}
            <strong style={{ color: "#a78bfa" }}>{courseTitle}</strong>. Acesta
            este un pas important în călătoria ta în AI!
          </Text>

          <Section style={badgeContainerStyle}>
            <Text style={badgeLabelStyle}>Nivel atins</Text>
            <Text style={badgeValueStyle}>
              {currentLevel} — {levelName}
            </Text>
            <Text style={xpTextStyle}>
              {totalXP.toLocaleString("ro-RO")} XP total acumulate
            </Text>
          </Section>

          <Text style={textStyle}>
            Profilul tău de portfolio a fost actualizat automat. Distribuie-l
            pe LinkedIn pentru a-ți arăta progresul!
          </Text>

          <Button href={`${siteUrl}/dashboard`} style={buttonStyle}>
            Vezi profilul tău →
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

const emojiStyle: React.CSSProperties = {
  fontSize: "56px",
  margin: "16px 0",
};

const bigTextStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const textStyle: React.CSSProperties = {
  color: "#e5e7eb",
  fontSize: "15px",
  lineHeight: "1.6",
};

const badgeContainerStyle: React.CSSProperties = {
  backgroundColor: "#1a1a2e",
  borderRadius: "12px",
  padding: "20px",
  margin: "24px 0",
  textAlign: "center",
};

const badgeLabelStyle: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "0 0 4px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const badgeValueStyle: React.CSSProperties = {
  color: "#a78bfa",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const xpTextStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "0",
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
