import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    // 1. Get API Key from Headers
    const apiKey = req.headers.get("x-api-key");
    
    // 2. Validate against Environment Variable
    if (apiKey !== process.env.CONTACT_FORM_API_KEY) {
      return NextResponse.json(
        { message: "Invalid API Key" },
        { status: 401 }
      );
    }

    // 3. Process Request
    const body = await req.json();

    if (!body.name ||!body.email ||!body.company ||!body.interest) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if(body.action === "bookDemo") {
      // Send email to the specified email address with booking details
      // Example: sendEmail(body.email, "Booking Details", bookingDetailsTemplate(body));
    }

    
    console.log("Received contact form data:", body);

    // Optional: Save to database
    // await prisma.contactSubmission.create({
    //   data: {
    //     name: body.name,
    //     email: body.email,
    //     company: body.company,
    //     interest: body.interest,
    //     phone: body.phone,
    //   }
    // });

    return NextResponse.json(
      { message: "Contact form submitted successfully!" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}