import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    const data = await request.json();
    // console.log("data", data);
    return NextResponse.json({ message: "Request recieved" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { id } = await params;
    const updatedLead = await prisma.lead.update({
      where: {
        id: id
      },
      data: {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
      },
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
