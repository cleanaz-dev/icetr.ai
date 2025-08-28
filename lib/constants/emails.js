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

export function FollowUpEmail({
  userEmail,
  userName,
  companyName,
  callerNumber,
  callTime,
  followUpId,
  reason = "voicemail",
}) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BASE_URL
      : "http://localhost:3000";

  const reasonText =
    reason === "voicemail" ? "left a voicemail" : "called but didn't connect";

  return (
    <Html>
      <Head />
      <Preview>
        Follow-up needed: {companyName} {reasonText}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>📞 Follow-up Required</Heading>
          <Text style={text}>
            Hello <strong>{userName}</strong>,
          </Text>
          <Text style={text}>
            <strong>{companyName}</strong> {reasonText} from {callerNumber} at{" "}
            {callTime}.
          </Text>
          <Text style={text}>
            A follow-up has been scheduled for you within the next 24 hours.
          </Text>

          <Link
            href={`${baseUrl}/dashboard/follow-ups/${followUpId}`}
            style={cta}
          >
            View Follow-up Details
          </Link>

          <Hr style={hr} />

          <Text style={smallText}>
            <strong>Quick Actions:</strong>
            <br />•{" "}
            <Link href={`${baseUrl}/dashboard/leads`} style={link}>
              View All Leads
            </Link>
            <br />•{" "}
            <Link href={`${baseUrl}/dashboard/calls`} style={link}>
              Call History
            </Link>
            <br />•{" "}
            <Link href={`tel:${callerNumber}`} style={link}>
              Call Back Now
            </Link>
          </Text>

          <Text style={footer}>
            Best regards,
            <br />— The icetr.ai Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function preOnboardingEmail({ name, onboardingUrl }) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BASE_URL
      : "http://localhost:3000";

  return (
    <Html>
      <Head />
      <Preview>Welcome to icetr.ai — Let’s get started!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome to icetr.ai 👋</Heading>
          <Text style={text}>
            Hi <strong>{name}</strong>!,
          </Text>
          <Text style={text}>
            Thank you for choosing icetr.ai! We're excited to help you
            supercharge your outreach and campaign strategies.
          </Text>
          <Text style={text}>
            To get you started smoothly, we've set up a quick onboarding
            process. Just follow the steps on your onboarding page and you’ll be
            up and running in no time.
          </Text>

          <Button
            href={`${baseUrl}/${onboardingUrl}`}
            style={cta}
            target="_blank"
            rel="noopener noreferrer"
          >
            Go to Onboarding
          </Button>

          <Text style={text}>
            If you have any questions along the way, our support team is here to
            help.
          </Text>
          <Text style={text}>Welcome aboard!</Text>
          <Text style={footer}>— The icetr.ai Team</Text>
        </Container>
      </Body>
    </Html>
  );
}
export function InviteEmail({ email, uuid, orgId }) {
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
            You've been invited to join <strong>icetr.ai</strong> – an advanced
            platform designed to elevate your outreach and campaign strategies.
          </Text>
          <Link href={`${baseUrl}/invitee/${uuid}?orgId=${orgId}`} style={cta}>
            Accept Your Invite
          </Link>
          <Text style={footer}>
            If you have any questions, feel free to reply to this email.
            <br />— The icetr.ai Team
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
            Thank you for joining the icetr.ai waitlist. We're excited to have
            you with us as we prepare to launch our advanced outreach platform.
          </Text>
          <Text style={text}>
            We'll notify you as soon as your spot opens up.
          </Text>
          <Text style={footer}>
            Stay tuned for updates!
            <br />— The icetr.ai Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function AddOnPurchaseEmail({ 
  name, 
  addOnDescription, 
  purchaseDate, 
  purchasePrice 
}) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BASE_URL
      : "http://localhost:3000";

  return (
    <Html>
      <Head />
      <Preview>icetrai Add-On Purchase: {addOnDescription}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Add-On Purchase Confirmed! ✅</Heading>
          
          <Text style={text}>
            Hi {name},
          </Text>
          
          <Text style={text}>
            Great news! Your <strong>{addOnDescription}</strong> purchase has been confirmed and is now active on your account.
          </Text>
          
          {/* Purchase Details */}
          <div style={purchaseDetails}>
            <Text style={smallText}>Purchase Details:</Text>
            <Text style={text}>
              • Add-on: {addOnDescription}<br/>
              • Date: {purchaseDate}<br/>
              • Amount: ${purchasePrice}
            </Text>
          </div>
          
          <Hr style={hr} />
          
          {/* CTA */}
          <Link href={`${baseUrl}/home`} style={cta}>
            Start Using Your Add-On
          </Link>
          
          <Text style={text}>
            Your new features are ready to use! Log in to your dashboard to get started.
          </Text>
          
          <Text style={text}>
            Questions? Contact us at{" "}
            <Link href="mailto:support@icetrai.com" style={link}>
              support@icetrai.com
            </Link>
          </Text>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            Thanks for choosing icetrai!
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function BookingEmail({
  name,
  bookingDate, // This will be '2025-08-28T11:00:00-04:00'
  bookingDuration = 30, // Default to 30 minutes
  service = "Consultation",
  join_url,
  organizer = "LLM GEM Support <support@llmgem.com>",
}) {

  // console log all signature values
  console.log({
    name,
    bookingDate,
    bookingDuration,
    service,
    join_url,
    organizer,
  });

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BASE_URL
      : "http://localhost:3000";

  // Parse the ISO datetime string for display purposes only
  const bookingDateTime = new Date(bookingDate);
  
  // Format display date and time
  const displayDate = bookingDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const displayTime = bookingDateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <Html>
      <Head />
      <Preview>Your booking is confirmed for {displayDate} at {displayTime}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            Booking Confirmed! 🎉
          </Heading>
          
          <Text style={text}>
            Hi {name},
          </Text>
          
          <Text style={text}>
            Great news! Your {service} session has been successfully booked. We're excited to work with you.
          </Text>

          <div style={purchaseDetails}>
            <Text style={{ ...text, marginBottom: "12px", fontWeight: "600", color: "#ffffff" }}>
              Booking Details
            </Text>
            <Text style={{ ...smallText, marginBottom: "8px" }}>
              <strong>Service:</strong> {service}
            </Text>
            <Text style={{ ...smallText, marginBottom: "8px" }}>
              <strong>Date:</strong> {displayDate}
            </Text>
            <Text style={{ ...smallText, marginBottom: "8px" }}>
              <strong>Time:</strong> {displayTime}
            </Text>
            <Text style={{ ...smallText, marginBottom: "0" }}>
              <strong>Duration:</strong> {bookingDuration} minutes
            </Text>
          </div>

          {join_url && (
            <>
              <Text style={text}>
                Join your session using the link below:
              </Text>
              <Button href={join_url} style={cta}>
                Join Session
              </Button>
            </>
          )}

          <Hr style={hr} />

          <Text style={smallText}>
            <strong>What to expect:</strong><br />
            • We'll send you a reminder 1hr reminder before your session<br />
            • Please join the call 2-3 minutes early<br />
            • Have any relevant materials ready to share
          </Text>

          <Text style={smallText}>
            Need to reschedule or have questions? Reply to this email or visit our{" "}
            <Link href={`${baseUrl}/contact`} style={link}>
              support page
            </Link>
            .
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Best regards,<br />
            The LLM GEM Team<br />
            <Link href={baseUrl} style={link}>
              llmgem.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
// Add this style for the purchase details box
const purchaseDetails = {
  backgroundColor: "#111111",
  padding: "16px",
  borderRadius: "6px",
  border: "1px solid #333333",
  marginBottom: "24px",
};
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


