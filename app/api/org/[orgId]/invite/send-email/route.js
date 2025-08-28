import { sendInviteEmail } from "@/lib/services/integrations/resend";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import redis from "@/lib/services/integrations/redis";
import { validateHasPermission } from "@/lib/db/validations";
import { auth } from "@clerk/nextjs/server";

export async function POST(request, { params }) {
  const { userId: clerkId } = await auth();
  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
    if (!clerkId) {
    return NextResponse.json({ message: "Invalid User" }, { status: 401 });
  }
  try {

    await validateHasPermission(clerkId, ["user.invite"])
    const {
      email,
      senderUserId,
      teamId,
      userRole = "Agent",
    } = await request.json();
    console.log("email", email);
    console.log("senderUserId", senderUserId);
    console.log("teamId", teamId);
    console.log("user role", userRole);

    const existiningKeys = await redis.keys(`invitee:${orgId}:*`);

    // Check for existing invites
    for (const key of existiningKeys) {
      // console.log("Checking key:", key);
      const invitee = await redis.json.get(key, "$");

      if (invitee?.email === email) {
        return NextResponse.json(
          { message: "Email invite already sent" },
          { status: 400 }
        );
      }
    }

    await validateHasPermission(senderUserId, ["user.create"]);

    const sendingUser = await prisma.user.findUnique({
      where: { clerkId: senderUserId },
      select: { orgId: true },
    });

    // Remove this line - it's preventing the invite creation code from running
    // return NextResponse.json({ message: "Exisiting User" }, { status: 500 });

    // Step 3: Proceed with creating a new invite
    const uuid = randomUUID();
    await sendInviteEmail(email, uuid, orgId);

    // Store the invitee data in Redis JSON
    await redis.json.set(`invitee:${orgId}:${uuid}`, ".", {
      id: uuid,
      email: email,
      orgId: sendingUser.orgId,
      userRole: userRole,
      teamId: teamId,
      createdAt: new Date().toISOString(),
      status: "pending",
    });

    // Set expiration (72 hours)
    await redis.expire(`invitee:${orgId}:${uuid}`, 60 * 60 * 72);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
