import { NextResponse } from "next/server";
import prisma from "@/lib/service/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request, { params }) {
  const { userId } = await auth();
  const { userId: requestedUserId } = await params; // Extract userId from dynamic route

  // Ensure the authenticated user can only access their own calls
  if (!userId || userId !== requestedUserId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }

  try {
    const calls = await prisma.call.findMany({
      where: { userId: requestedUserId },
    });
    return NextResponse.json({ calls });
  } catch (error) {
    console.error(error); // Log for debugging
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}