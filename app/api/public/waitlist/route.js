import { NextResponse } from "next/server";
import prisma from "@/lib/service/prisma";
import { sendWaitListEmail } from "@/lib/service/resend";

export async function POST(request) {
  try {
    const data = await request.json();

    await sendWaitListEmail(data.email, data.name);

    await prisma.waitList.create({
      data: {
        email: data.email,
        name: data.name,
        notes: data.notes || "",
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
