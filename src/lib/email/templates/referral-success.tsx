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

interface ReferralSuccessEmailProps {
  name: string;
  referredName: string;
  xpEarned: number;
  totalReferrals: number;
  siteUrl: string;
}

export function ReferralSuccessEmail({
  name,
  referredName,
  xpEarned,
  totalReferrals,
  siteUrl,
}: ReferralSuccessEmailProps) {
  return (
    <Html lang="ro">
      <Head />
      <Preview>{`${referredName} s-a alăturat DevPath RO prin link-ul tău! +${xpEarned} XP 🤝`}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>DevPath RO 🧠</Heading>

          <Text style={emojiStyle}>🤝</Text>

          <Text style={textStyle}>Salut, {name}!</Text>
          <Text style={textStyle}>
            <strong style={{ color: "#a78bfa" }}>{referredName}</strong> tocmai
            s-a înregistrat pe DevPath RO folosind link-ul tău de invitație.
          </Text>
          <Text style={textStyle}>
            Ai câștigat{" "}
            <strong style={{ color: "#a78bfa" }}>+{xpEarned} XP</strong> ca
            bonus de referral. Ai invitat{" "}
            <strong style={{ color: "#a78bfa" }}>
              {totalReferrals} {totalReferrals === 1 ? "persoană" : "persoane"}
            </strong>{" "}
            până acum.
          </Text>

          {totalReferrals === 1 && (
            <Text style={badgeTextStyle}>
              🏅 Ai deblocat badge-ul <strong>Ambasador</strong>!
            </Text>
          )}
          {totalReferrals === 3 && (
            <Text style={badgeTextStyle}>
              🌐 Ai deblocat badge-ul <strong>Recrutorul</strong>!
            </Text>
          )}

          <Text style={textStyle}>
            Continuă să inviți prieteni — împreună construim cea mai bună
            comunitate de AI din România!
          </Text>

          <Button href={`${siteUrl}/profile`} style={buttonStyle}>
            Vezi link-ul tău de invitație →
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

const badgeTextStyle: React.CSSProperties = {
  color: "#fbbf24",
  fontSize: "15px",
  fontWeight: "600",
  backgroundColor: "#1a1a2e",
  borderRadius: "8px",
  padding: "12px 16px",
  margin: "8px 0",
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
