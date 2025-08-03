import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const followUps = await prisma.followUp.findMany({
      where: {
        completed: false,
        lead: {
          assignedUserId:  user.id,
        }
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            company: true,
            status: true,
            campaign: true
          }
        },

      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    return NextResponse.json({ 
      followUps,
      count: followUps.length 
    });
    
  } catch (error) {
    console.error("Error fetching follow-ups:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}