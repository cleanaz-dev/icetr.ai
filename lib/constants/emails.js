// constants/emails.js
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Link,
} from "@react-email/components";

const baseUrl = process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_BASE_URL : "http://localhost:3000"

export function InviteEmail({ email, uuid }) {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to icetr.ai – join us today</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome to icetr.ai 🎉</Heading>
          <Text style={text}>
            Hello! <strong>{email}</strong>,
          </Text>
          <Text style={text}>
            You've been invited to join <strong>icetr.ai</strong> – an advanced platform designed to elevate your outreach and campaign strategies.
          </Text>
          <Link href={`${baseUrl}/invitee/${uuid}`} style={cta}>
            Accept Your Invite
          </Link>
          <Text style={footer}>
            If you have any questions, feel free to reply to this email.<br />
            — The icetr.ai Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ✅ Named export
export function WaitListEmail({ email, name }) {
  return (
    <Html>
      <Head />
      <Preview>You're on the waitlist for icetr.ai</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>You're on the list! 🎉</Heading>
          <Text style={text}>
            Hello! <strong>{email}</strong>,
          </Text>
          <Text style={text}>
            Thank you for joining the icetr.ai waitlist. We're excited to have you with us as we prepare to launch our advanced outreach platform.
          </Text>
          <Text style={text}>
            We'll notify you as soon as your spot opens up.
          </Text>
          <Text style={footer}>
            Stay tuned for updates!<br />
            — The icetr.ai Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#000000",
  margin: "0 auto",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
};

const container = {
  margin: "0 auto",
  maxWidth: "480px",
  padding: "72px 24px 64px",
  textAlign: "left",
};

const heading = {
  color: "#ffffff",
  fontSize: "26px",
  fontWeight: 700,
  lineHeight: "36px",
  marginBottom: "20px",
};

const text = {
  color: "#cccccc",
  fontSize: "16px",
  lineHeight: "28px",
  marginBottom: "24px",
};

const cta = {
  display: "inline-block",
  backgroundColor: "#0070f3",
  color: "#ffffff",
  fontWeight: "600",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  marginBottom: "32px",
};

const footer = {
  color: "#555555",
  fontSize: "14px",
  lineHeight: "24px",
  marginTop: "24px",
};
