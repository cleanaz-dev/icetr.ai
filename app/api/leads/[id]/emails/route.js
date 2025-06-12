import { NextResponse } from "next/server";
import prisma from "@/lib/service/prisma";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";
import {
  LoomVSLEmail,
  FollowUpEmail,
  IntroductionEmail,
  ProductEmail,
} from "@/lib/constants/sales-emails";

const resend = new Resend(process.env.RESEND_API_KEY);
const senderEmail = process.env.RESEND_SENDER_EMAIL;

// Template mapping with names
const EMAIL_TEMPLATES = {
  product: {
    component: ProductEmail,
    name: "Product Email",
    subjectTemplate: (lead) => `Solution for ${lead.company}`,
  },
  followup: {
    component: FollowUpEmail,
    name: "Follow-up Email",
    subjectTemplate: (lead) => `Great talking with you, ${lead.name}`,
  },
  introduction: {
    component: IntroductionEmail,
    name: "Introduction Email",
    subjectTemplate: (lead, user) => `Introduction from ${user.firstName}`,
  },
  loom: {
    component: LoomVSLEmail,
    name: "Loom VSL Email",
    subjectTemplate: () => "Check out this 2min video",
  },
};

export async function POST(req, { params }) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ message: "Invalid User" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { templateId, emailAddress, leadData } = await req.json();

    // Validate template ID
    if (!EMAIL_TEMPLATES[templateId]) {
      return NextResponse.json(
        { message: "Invalid template ID" },
        { status: 400 }
      );
    }

    // Get template info early
    const template = EMAIL_TEMPLATES[templateId];
    const EmailComponent = template.component;
    const templateName = template.name;

    // Fetch the lead from database
    const lead = await prisma.lead.findUnique({
      where: { id: id },
    });

    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    // Fetch the user data
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const emailData = {
      lead,
      user,
      ...leadData,
    };

    // Log lead activity with template name (now templateName is defined)
    const leadActivity = await prisma.leadActivity.create({
      data: {
        lead: {
          connect: { id: lead.id },
        },
        type: "EMAIL",
        content: `${templateName} sent to ${lead.name}`,
        createdUser: { connect: { id: user.id } },
      },
    });

    const subject = template.subjectTemplate(lead, user);

    // Send with Resend
    const { data, error } = await resend.emails.send({
      from: `icetr.ai <${senderEmail}>`,
      to: emailAddress,
      subject: subject,
      react: EmailComponent(emailData),
      replyTo: "info@llmgem.com",
      tags: [
        {
          name: "activity_id",
          value: leadActivity.id,
        },
      ],
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { message: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Email sent successfully",
        emailId: data?.id,
        activityId: leadActivity.id,
        templateName,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}