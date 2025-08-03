import { sendInviteEmail } from "@/lib/services/integrations/resend";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import redis from "@/lib/services/integrations/redis";



export async function POST(request) {
  try {
    const { email, senderUserId, teamId, userRole = "Agent"  } = await request.json();
    console.log("email", email)
    console.log("senderUserId", senderUserId)
    console.log("teamId", teamId)
    console.log("user role", userRole)


    const existiningKeys = await redis.keys("invitee:*");


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

    const sendingUser = await prisma.user.findUnique({
      where: {clerkId: senderUserId },
      select: {orgId: true}
    })

    // Remove this line - it's preventing the invite creation code from running
    // return NextResponse.json({ message: "Exisiting User" }, { status: 500 });

    // Step 3: Proceed with creating a new invite
    const uuid = randomUUID();
    await sendInviteEmail(email, uuid);

    // Store the invitee data in Redis JSON
    await redis.json.set(`invitee:${uuid}`, ".", {
      id: uuid,
      email: email,
      orgId: sendingUser.orgId,
      userRole: userRole,
      teamId: teamId,
      createdAt: new Date().toISOString(),
      status: "pending"
    });

    // Set expiration (48 hours)
    await redis.expire(`invitee:${uuid}`, 60 * 60 * 48);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}