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
  Hr,
  Button,
} from "@react-email/components";

const baseUrl = process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_BASE_URL : "http://localhost:3000"

export function FollowUpEmail({ 
  userEmail, 
  userName, 
  companyName, 
  callerNumber, 
  callTime, 
  followUpId, 
  reason = "voicemail" 
}) {
  const baseUrl = process.env.NODE_ENV === "production" 
    ? process.env.NEXT_PUBLIC_BASE_URL 
    : "http://localhost:3000";
    
  const reasonText = reason === "voicemail" 
    ? "left a voicemail" 
    : "called but didn't connect";

  return (
    <Html>
      <Head />
      <Preview>Follow-up needed: {companyName} {reasonText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>📞 Follow-up Required</Heading>
          <Text style={text}>
            Hello <strong>{userName}</strong>,
          </Text>
          <Text style={text}>
            <strong>{companyName}</strong> {reasonText} from {callerNumber} at {callTime}.
          </Text>
          <Text style={text}>
            A follow-up has been scheduled for you within the next 24 hours.
          </Text>
          
          <Link href={`${baseUrl}/dashboard/follow-ups/${followUpId}`} style={cta}>
            View Follow-up Details
          </Link>
          
          <Hr style={hr} />
          
          <Text style={smallText}>
            <strong>Quick Actions:</strong><br />
            • <Link href={`${baseUrl}/dashboard/leads`} style={link}>View All Leads</Link><br />
            • <Link href={`${baseUrl}/dashboard/calls`} style={link}>Call History</Link><br />
            • <Link href={`tel:${callerNumber}`} style={link}>Call Back Now</Link>
          </Text>
          
          <Text style={footer}>
            Best regards,<br />
            — The icetr.ai Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

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

const hr = {
  borderColor: "#333333",
  margin: "32px 0",
};

const smallText = {
  color: "#999999",
  fontSize: "14px",
  lineHeight: "24px",
  marginBottom: "24px",
};

const link = {
  color: "#0070f3",
  textDecoration: "underline",
};