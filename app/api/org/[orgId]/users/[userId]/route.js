import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req, { params }) {
  try {
    const { userId } = await params;
    const { userId:clerkId} = await auth()
    
    if(!clerkId) {
      return NextResponse.json(
        { message: "Invalid User"},
        { status: 401}
      )
    }

    const { timezone, language } = await req.json();

    await prisma.user.update({
      where: { clerkId: clerkId },
      data: {
        userSettings: {
          update: {
            timezone: timezone,
            language: language
          }
        }
      }
    })
  
    return NextResponse.json(
      { message: `Received role update request for user ${userId}` },
      { status: 200 }
    );
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
