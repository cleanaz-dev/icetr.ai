import { Resend } from "resend";

import InviteTemplate from "../constants/emails";

const resend = new Resend(process.env.RESEND_API_KEY);
const senderEmail = process.env.RESEND_SENDER_EMAIL;

export async function sendInviteEmail(email, uuid) {
  try {
    const emailResponse = await resend.emails.send({
      to: email,
      subject: "Welcome to icetr.ai - you've been invited!",
      react: InviteTemplate({ email, uuid }),
      from: `icetr.ai <${senderEmail}>`,
      replyTo: "info@llmgem.com",
    });
    return emailResponse;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}
