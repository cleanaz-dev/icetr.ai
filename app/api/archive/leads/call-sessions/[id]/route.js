

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req, {params}){
  const {id} = await params
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized User"}, {status: 401})
  }
  
  try {
    const body = await req.json();
    
    const updatedSession = await prisma.callSession.update({
      where: {
        id: id
      },
      data: {
        ...body, // This will include totalCalls, successfulCalls, totalDuration, endedAt, isActive, etc.
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedSession);
    
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}