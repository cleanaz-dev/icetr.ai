import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { validateHasPermission, validateOrgAccess } from "@/lib/db/validations";

export async function GET(req, { params }) {
  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized user" }, { status: 401 });
  }

  try {
    await validateOrgAccess(clerkId, orgId);
    await validateHasPermission(clerkId, ["broadcast.read"]);

    const broadcasts = await prisma.broadcast.findMany({
      where: {
        teams: {
          some: {
            organization: { id: orgId },
          },
        },
      },
      include: {
        createdUser: {
          select:{
            id: true,
            firstname: true,
            lastname: true,
            fullname: true,
            imageUrl: true,

          }
        },
        teams: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(broadcasts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
}

export async function POST(req, { params }) {
  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized user" }, { status: 401 });
  }

  try {
    await validateOrgAccess(clerkId, orgId);
    await validateHasPermission(clerkId, ["broadcast.create"]);

    const { title, message, type, targetTeams } = await req.json();

    // 1. fetch the teams we care about
    const teams = await prisma.team.findMany({
      where: {
        id: { in: targetTeams },
      },
      include: {
        members: true,
      },
    });

    // 2. collect every user once
    const allUserIds = new Set();
    teams.forEach((team) => {
      team.members.forEach((member) => {
        allUserIds.add(member.userId);
      });
    });

    // 3. create the broadcast
    const broadcast = await prisma.broadcast.create({
      data: {
        title,
        message,
        type: type.toUpperCase(),
        teams: {
          connect: teams.map((t) => ({ id: t.id })), // ← array of objects
        },
        createdUser: {
          connect: {
            clerkId: clerkId,
          },
        },
        notifications: {
          create: Array.from(allUserIds).map((userId) => ({
            userId,
            title,
            message,
            type: "BROADCAST",
            broadcastType: type.toUpperCase(),
            status: "pending",
          })),
        },
      },
      include: {
        notifications: true,
        teams: true,
      },
    });

    return NextResponse.json({
      message: "Broadcast created successfully",
      broadcast: {
        id: broadcast.id,
        title: broadcast.title,
        notificationsSent: broadcast.notifications.length,
      },
    });
  } catch (error) {
    console.error("Broadcast creation error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
