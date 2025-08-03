import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    // Find the user by clerkId to get the MongoDB _id
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    // Verify the notification belongs to the authenticated user
    const notification = await prisma.notification.findUnique({
      where: { id: id },
      select: { userId: true }
    });

    if (!notification) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    if (notification.userId !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Update the notification status
    const updatedNotification = await prisma.notification.update({
      where: { id: id },
      data: {
        status: "read"
      }
    });

    return NextResponse.json({ 
      message: "Notification updated successfully",
      notification: updatedNotification 
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ 
      message: "Internal server error" 
    }, { status: 500 });
  }
}