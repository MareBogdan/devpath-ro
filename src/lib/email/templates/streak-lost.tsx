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
} from "@react-email/components";

interface StreakLostEmailProps {
  name: string;
  lostStreakCount: number;
  siteUrl: string;
}

export function StreakLostEmail({
  name,
  lostStreakCount,
  siteUrl,
}: StreakLostEmailProps) {
  return (
    <Html lang="ro">
      <Head />
      <Preview>{`Streak-ul tău de ${lostStreakCount} zile s-a pierdut 😔 — revino azi!`}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>DevPath RO 🧠</Heading>

          <Text style={emojiStyle}>😔</Text>

          <Text style={textStyle}>Salut, {name}!</Text>
          <Text style={textStyle}>
            Streak-ul tău de{" "}
            <strong style={{ color: "#f59e0b" }}>{lostStreakCount} zile</strong>{" "}
            s-a pierdut pentru că n-ai mai deschis o lecție ieri.
          </Text>
          <Text style={textStyle}>
            Nu-i nicio problemă — orice campion are zile proaste. Important e să
            revii azi și să construiești un streak și mai lung!
          </Text>

          <Button href={`${siteUrl}/dashboard`} style={buttonStyle}>
            Începe un streak nou →
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
  fontSize: "48px",
  margin: "16px 0",
};

const textStyle: React.CSSProperties = {
  color: "#e5e7eb",
  fontSize: "15px",
  lineHeight: "1.6",
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
