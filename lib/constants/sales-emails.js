// emails/sales-templates.js
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

const baseUrl = process.env.NODE_ENV === "production" 
  ? process.env.NEXT_PUBLIC_BASE_URL 
  : "http://localhost:3000";

// 1. Product Email Template
export function ProductEmail({ lead, user }) {
  return (
    <Html>
      <Head />
      <Preview>Solution for {lead.company} - Let's discuss how we can help</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Hi {lead.name}! 👋</Heading>
          
          <Text style={text}>
            I hope this email finds you well. I'm {user.firstname} from {user.company || 'icetr.ai'}.
          </Text>
          
          <Text style={text}>
            I've been researching {lead.company} and I'm impressed by your work in the industry. 
            I believe our solution could help streamline your operations and drive significant growth.
          </Text>
          
          <Text style={text}>
            <strong>Here's what we can offer {lead.company}:</strong>
          </Text>
          
          <Text style={bulletPoint}>
            • <strong>Automated Outreach:</strong> Scale your sales efforts with intelligent automation
          </Text>
          <Text style={bulletPoint}>
            • <strong>Lead Intelligence:</strong> Get deeper insights into your prospects
          </Text>
          <Text style={bulletPoint}>
            • <strong>Performance Analytics:</strong> Track what's working and optimize your strategy
          </Text>
          
          <Text style={text}>
            Companies similar to {lead.company} have seen 40% increases in qualified leads within 90 days.
          </Text>
          
          <Button href={`${baseUrl}/book-demo?lead=${lead.id}`} style={cta}>
            Schedule a 15-minute Demo
          </Button>
          
          <Text style={text}>
            Would you be open to a brief conversation this week to explore how this could benefit {lead.company}?
          </Text>
          
          <Text style={footer}>
            Best regards,<br />
            {user.firstname} {user.lastname}<br />
            {user.email}<br />
            {user.phoneNumber && `${user.phoneNumber}`}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// 2. Follow-up Email Template
export function FollowUpEmail({ lead, user, callNotes }) {
  return (
    <Html>
      <Head />
      <Preview>Great talking with you, {lead.name} - Next steps</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Thanks for the great conversation! 🤝</Heading>
          
          <Text style={text}>
            Hi {lead.name},
          </Text>
          
          <Text style={text}>
            It was fantastic speaking with you earlier about {lead.company}'s goals and challenges. 
            I really enjoyed learning more about your current processes and where you see opportunities for improvement.
          </Text>
          
          <Text style={text}>
            <strong>Here's a quick recap of what we discussed:</strong>
          </Text>
          
          <Text style={bulletPoint}>
            • Your current lead generation challenges
          </Text>
          <Text style={bulletPoint}>
            • The potential 40% increase in qualified leads we discussed
          </Text>
          <Text style={bulletPoint}>
            • Timeline for implementation (Q1 2025)
          </Text>
          
          {callNotes && (
            <>
              <Text style={text}>
                <strong>Additional notes from our call:</strong>
              </Text>
              <Text style={callNotesStyle}>
                {callNotes}
              </Text>
            </>
          )}
          
          <Text style={text}>
            <strong>Next Steps:</strong>
          </Text>
          
          <Text style={bulletPoint}>
            • I'll send over the case study we discussed by tomorrow
          </Text>
          <Text style={bulletPoint}>
            • We'll schedule a technical demo for your team next week
          </Text>
          <Text style={bulletPoint}>
            • I'll prepare a custom proposal based on your specific needs
          </Text>
          
          <Button href={`${baseUrl}/calendar/${user.calendlyLink}`} style={cta}>
            Schedule Technical Demo
          </Button>
          
          <Text style={text}>
            Please don't hesitate to reach out if you have any questions in the meantime. 
            I'm here to help make this as smooth as possible for {lead.company}.
          </Text>
          
          <Text style={footer}>
            Looking forward to our next conversation!<br />
            {user.firstname} {user.lastname}<br />
            {user.email}<br />
            {user.phoneNumber && `${user.phoneNumber}`}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// 3. Introduction Email Template
export function IntroductionEmail({ lead, user }) {
  return (
    <Html>
      <Head />
      <Preview>Introduction from {user.firstName} - Quick question about {lead.company}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Quick introduction 👋</Heading>
          
          <Text style={text}>
            Hi {lead.name},
          </Text>
          
          <Text style={text}>
            I hope you don't mind the cold outreach. My name is {user.firstName} {user.lastName}, 
            and I'm with {user.organization || 'icetr.ai'} where we help companies like {lead.company} 
            {" "}streamline their sales processes and generate more qualified leads.
          </Text>
          
          <Text style={text}>
            I've been following {lead.company} and I'm impressed by your growth in the market. 
            It got me thinking about the challenges you might be facing with lead generation and sales automation.
          </Text>
          
          <Text style={text}>
            <strong>Quick question:</strong> Are you currently satisfied with your lead generation results, 
            or is this an area where you'd welcome improvement?
          </Text>
          
          <Text style={text}>
            The reason I ask is that we've helped similar companies in your industry increase their 
            qualified leads by 40% within 90 days, and I thought there might be an opportunity to 
            do something similar for {lead.company}.
          </Text>
          
          <Text style={text}>
            Would you be open to a brief 30-minute conversation to explore this? 
            I promise to keep it focused and valuable for your time.
          </Text>
          
          <Button href={`${baseUrl}/book-call?lead=${lead.id}`} style={cta}>
            Book a 30-minute Call
          </Button>
          
          <Text style={text}>
            If this isn't a priority right now, no worries at all. Just let me know and 
            I'll check back in a few months.
          </Text>
          
          <Text style={footer}>
            Best regards,<br />
            {user.firstname} {user.lastname}<br />
            {user.title && `${user.title} at ${user.organization || 'icetr.ai'}`}<br />
            {user.email}<br />
            {user.phoneNumber && `${user.phoneNumber}`}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// 4. Loom VSL Email Template
export function LoomVSLEmail({ lead, user, videoUrl }) {
  return (
    <Html>
      <Head />
      <Preview>Quick 2-minute video for {lead.name} at {lead.company}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>I made this for you, {lead.name} 🎬</Heading>
          
          <Text style={text}>
            Hi {lead.name},
          </Text>
          
          <Text style={text}>
            I recorded a quick 2-minute video specifically for you and {lead.company}. 
            It shows exactly how companies in your industry are solving their lead generation challenges.
          </Text>
          
          <Text style={text}>
            <strong>In this video, you'll see:</strong>
          </Text>
          
          <Text style={bulletPoint}>
            • The #1 mistake most companies make with lead generation
          </Text>
          <Text style={bulletPoint}>
            • A real example from a company similar to {lead.company}
          </Text>
          <Text style={bulletPoint}>
            • The simple strategy that led to 40% more qualified leads
          </Text>
          
          {/* Video thumbnail/link */}
   
            <Button href={videoUrl || `${baseUrl}/video/demo`} style={videoCta}>
              ▶️ 2-minute video
            </Button>
        
          
          <Text style={text}>
            I think you'll find it valuable, especially the part about lead scoring 
            (around the 1:20 mark).
          </Text>
          
          <Text style={text}>
            After watching, if you'd like to discuss how this could work specifically 
            for {lead.company}, I'd be happy to hop on a quick call.
          </Text>
          
          <Button href={`${baseUrl}/book-call?lead=${lead.id}&source=video`} style={cta}>
            Book a Follow-up Call
          </Button>
          
          <Text style={text}>
            Let me know what you think!
          </Text>
          
          <Text style={footer}>
            Best,<br />
            {user.firstname} {user.lastname}<br />
            {user.email}<br />
            P.S. The video is only 2 minutes – I promise it's worth your time! ⏰
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles (same as your original with some additions)
const main = {
  backgroundColor: "#000000",
  margin: "0 auto",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
};

const container = {
  margin: "0 auto",
  maxWidth: "580px",
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

const bulletPoint = {
  color: "#cccccc",
  fontSize: "16px",
  lineHeight: "28px",
  marginBottom: "12px",
  marginLeft: "0px",
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
  textAlign: "center",
};

const videoCta = {
  display: "inline-block",
  backgroundColor: "#ff4757",
  color: "#ffffff",
  fontWeight: "600",
  padding: "16px 32px",
  borderRadius: "8px",
  textDecoration: "none",
  marginBottom: "24px",
  fontSize: "18px",
  textAlign: "center",
};

const videoContainer = {
  textAlign: "center",
  marginBottom: "32px",
  padding: "24px",
  backgroundColor: "#111111",
  borderRadius: "8px",
  border: "1px solid #333333",
};

const callNotesStyle = {
  color: "#e0e0e0",
  fontSize: "14px",
  lineHeight: "24px",
  backgroundColor: "#111111",
  padding: "16px",
  borderRadius: "6px",
  borderLeft: "4px solid #0070f3",
  fontStyle: "italic",
  marginBottom: "24px",
};

const footer = {
  color: "#555555",
  fontSize: "14px",
  lineHeight: "24px",
  marginTop: "24px",
};