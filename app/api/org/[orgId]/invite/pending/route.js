import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllInvitees } from "@/lib/services/integrations/redis";
import { validateHasPermission } from "@/lib/db/validations";

export async function GET(req, { params }) {
  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await validateHasPermission(userId, ["user.update"]);
    const invitees = await getAllInvitees(orgId);
    return NextResponse.json({ invitees }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch invitees:", error);
    return NextResponse.json(
      { message: "Failed to fetch invitees" },
      { status: 500 }
    );
  }
}
