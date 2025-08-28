import { Resend } from "resend";

import {
  WaitListEmail,
  InviteEmail,
  FollowUpEmail,
  preOnboardingEmail,
  AddOnPurchaseEmail,
  BookingEmail,
} from "../../constants/emails";

const resend = new Resend(process.env.RESEND_API_KEY);
const senderEmail = process.env.RESEND_SENDER_EMAIL;

export async function sendInviteEmail(email, uuid, orgId) {
  try {
    const emailResponse = await resend.emails.send({
      to: email,
      subject: "Welcome to icetr.ai - you've been invited!",
      react: InviteEmail({ email, uuid, orgId }),
      from: `icetr.ai <${senderEmail}>`,
      replyTo: "info@llmgem.com",
    });
    return emailResponse;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendPreOnboardingEmail(email, name, onboardingUrl) {
  try {
    const emailResponse = await resend.emails.send({
      to: email,
      subject: "Welcome to icetr.ai - your onboarding is about to begin!",
      react: preOnboardingEmail({ name, onboardingUrl }),
      from: `icetr.ai <${senderEmail}>`,
      replyTo: "info@allmgem.com",
    });
    return emailResponse;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendAddOnPurchaseEmail({
  email,
  name,
  addOnDescription,
  purchaseDate,
  purchasePrice,
}) {
  try {
    const emailResponse = await resend.emails.send({
      to: email,
      subject: `Thank you for your purchase! `,
      react: AddOnPurchaseEmail({
        name,
        addOnDescription,
        purchaseDate,
        purchasePrice,
      }),
      from: `icetrai <${senderEmail}>`,
      replyTo: "info@allmgem.com",
    });
    return emailResponse;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendWaitListEmail(email, name) {
  try {
    const emailResponse = await resend.emails.send({
      to: email,
      subject: "Great things are coming your way 🚀",
      react: WaitListEmail({ email, name }),
      from: `icetr.ai <${senderEmail}>`,
      replyTo: "info@llmgem.com",
    });
    return emailResponse;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendFollowUpEmail({
  userEmail,
  userName,
  companyName,
  callerNumber,
  callTime,
  followUpId,
  reason = "voicemail",
}) {
  try {
    const subject =
      reason === "voicemail"
        ? `📞 Follow-up: ${companyName} left a voicemail`
        : `📞 Follow-up: Missed call from ${companyName}`;

    const emailResponse = await resend.emails.send({
      to: userEmail,
      subject: subject,
      react: FollowUpEmail({
        userEmail,
        userName,
        companyName,
        callerNumber,
        callTime,
        followUpId,
        reason,
      }),
      from: `icetr.ai <${senderEmail}>`,
      replyTo: "info@llmgem.com",
    });

    console.log("Follow-up email sent successfully:", emailResponse);
    return emailResponse;
  } catch (error) {
    console.error("Error sending follow-up email:", error);
    throw new Error("Failed to send follow-up email");
  }
}
export async function sendBookingEmail({
  to,
  leadName,
  bookingTime,
  duration,
  joinUrl,
  bookingId,
  orgName,
}) {
  try {
    // Generate the ICS attachment data
    const attachmentData = generateMeetingAttachment({
      name: leadName,
      bookingDate: bookingTime,
      bookingDuration: duration,
      service: "Consultation", // You might want to pass this as a parameter too
      join_url: joinUrl,
      organizer: orgName,
    });

    // Send email with React template and ICS attachment
    const emailResponse = await resend.emails.send({
      to: to,
      subject: `${leadName} - your booking is confirmed!`,
      react: BookingEmail({
        name: leadName,
        bookingDate: bookingTime,
        organizer: orgName,
        bookingId,
        bookingDuration: duration,
        join_url: joinUrl,
      }),
      from: `${orgName} <${senderEmail}>`,
      replyTo: "info@allmgem.com",
      attachments: [attachmentData],
    });

    return emailResponse;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}



export function generateMeetingAttachment({
  name,
  bookingDate, // '2025-08-28T11:00:00-04:00'
  bookingDuration = 30,
  service = "Consultation",
  join_url,
  organizer = "LLM GEM Support <support@llmgem.com>",
}) {
  // Parse datetime and calculate end time
  const bookingDateTime = new Date(bookingDate);
  const endDateTime = new Date(bookingDateTime.getTime() + (bookingDuration * 60 * 1000));
  
  // Format dates for ICS (UTC timestamps in YYYYMMDDTHHMMSSZ format)
  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const startUTC = formatICSDate(bookingDateTime);
  const endUTC = formatICSDate(endDateTime);
  const timestampUTC = formatICSDate(new Date());

  // Generate ICS file content
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LLM GEM//Booking Confirmation//EN
BEGIN:VEVENT
UID:${startUTC}-${name}@llmgem.com
DTSTAMP:${timestampUTC}
DTSTART:${startUTC}
DTEND:${endUTC}
SUMMARY:${service} Session with LLM GEM
DESCRIPTION:Join your ${service} session here: ${join_url || 'TBD'}
LOCATION:Zoom Call
ORGANIZER;CN="${organizer.split("<")[0].trim()}":mailto:${organizer.includes("<") ? organizer.split("<")[1].replace(">", "") : "support@llmgem.com"}
URL:${join_url || ''}
END:VEVENT
END:VCALENDAR`;

  // Return attachment object for Resend
  return {
    filename: `booking-${bookingDateTime.toISOString().split('T')[0]}.ics`,
    content: Buffer.from(icsContent),
    contentType: "text/calendar",
  };
}