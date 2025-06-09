import { sendInviteEmail } from "@/lib/service/resend";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import redis from "@/lib/service/redis";



export async function POST(request) {
  try {
    const { email, orgId } = await request.json();

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

    // Remove this line - it's preventing the invite creation code from running
    // return NextResponse.json({ message: "Exisiting User" }, { status: 500 });

    // Step 3: Proceed with creating a new invite
    const uuid = randomUUID();
    await sendInviteEmail(email, uuid);

    // Store the invitee data in Redis JSON
    await redis.json.set(`invitee:${uuid}`, ".", {
      id: uuid,
      email: email,
      orgId: orgId,
      createdAt: new Date().toISOString(),
      status: "pending"
    });

    // Set expiration (24 hours)
    await redis.expire(`invitee:${uuid}`, 60 * 60 * 24);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}