
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllInvitees } from "@/lib/service/redis"

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const invitees = await getAllInvitees();
    return NextResponse.json({ invitees }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch invitees:", error);
    return NextResponse.json(
      { message: "Failed to fetch invitees" },
      { status: 500 }
    );
  }
}