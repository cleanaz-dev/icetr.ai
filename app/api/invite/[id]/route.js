// app/api/invite/[id]/route.js
import { NextResponse } from "next/server";
import redis from "@/lib/service/redis";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(request, { params }) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;


    // Delete the invitation from Redis with the correct key format
    const result = await redis.del(`invitee:${id}`);


    if (result === 0) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Invitation deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}