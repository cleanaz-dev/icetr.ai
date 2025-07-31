import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/services/prisma";
import { validateHasPermission } from "@/lib/services/db/validations";

export async function POST(request, { params }) {
  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ messag: "Invalid Request" }, { status: 401 });
  }
  try {
    await validateHasPermission(clerkId, ["team.create"]);
    const { name, addSelf } = await request.json();
    console.log("name", name, "addSelf", addSelf);
if (addSelf) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
    },
  });

  // Create team with manager and member in a single transaction
  const newTeam = await prisma.team.create({
    data: {
      name: name,
      organization: {
        connect: {
          id: orgId,
        },
      },
      manager: {
        connect: {
          id: user.id,
        },
      },
      members: {
        create: {
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      },
    },
    include: {
      members: true, // Include members in the response
    },
  });

      return NextResponse.json(
        {
          message: "New Team Create Successfuly",
          newTeam: newTeam,
          newTeamMembers: newTeam.members,
        },
        { status: 200 }
      );
    } else {
      const newTeam = await prisma.team.create({
        data: {
          name: name,
          organization: { connect: { id: orgId } },
        },
      });

      const newTeamMembers = []

      return NextResponse.json(
        {
          message: "New Team Create Successfuly",
          newTeam: newTeam,
          newTeamMembers: newTeamMembers,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
