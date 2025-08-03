// app/api/users/[userId]/role/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function PATCH(req, { params }) {
  const { userId } = params;                 // user whose role is being changed
  const { role } = await req.json();
  const { userId: clerkId } = await auth();  // caller

  // 1. Must be logged in
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 2. Optional: only admins or managers can change roles
  const caller = await prisma.user.findUnique({
    where: { clerkId },
    select: { role: true },
  });

  if (!["admin", "manager"].includes(caller.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // 3. Update DB and Clerk
  try {
    await prisma.user.update({
      where: { clerkId: userId },
      data: { role },
    });

    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
    });

    return NextResponse.json({ message: "Role updated" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err.message || "Server Error" },
      { status: 500 }
    );
  }
}