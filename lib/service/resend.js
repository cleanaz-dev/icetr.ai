import { Resend } from "resend";

import { WaitListEmail, InviteEmail, FollowUpEmail } from "../constants/emails";

const resend = new Resend(process.env.RESEND_API_KEY);
const senderEmail = process.env.RESEND_SENDER_EMAIL;

export async function sendInviteEmail(email, uuid) {
  try {
    const emailResponse = await resend.emails.send({
      to: email,
      subject: "Welcome to icetr.ai - you've been invited!",
      react: InviteEmail({ email, uuid }),
      from: `icetr.ai <${senderEmail}>`,
      replyTo: "info@llmgem.com",
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
    })
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
  reason = "voicemail" 
}) {
  try {
    const subject = reason === "voicemail" 
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
        reason 
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