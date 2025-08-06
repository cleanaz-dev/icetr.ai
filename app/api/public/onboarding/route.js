import { createClerkClient } from "@clerk/backend";
import { NextResponse } from "next/server";
import { RoleType, TeamRole } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("data:", data);
    const {
      firstname,
      lastname,
      email,
      organizationName,
      country,
      teamName,
      invites = [],
      tierSettingsId,
      customerId,
    } = data;

    const response = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (response.data.length === 0) {
      return NextResponse.json(
        { error: "No matching user found in Clerk" },
        { status: 404 }
      );
    }

    const clerkUser = response.data[0];

    // 🔁 Wrap everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User

      const user = await tx.user.create({
        data: {
          firstname,
          lastname,
          fullname: firstname + " " + lastname,
          email,
          clerkId: clerkUser.id,
          imageUrl: clerkUser.imageUrl,
          role: RoleType.SuperAdmin,
        },
      });

      const team = await tx.team.create({
        data: {
          name: teamName,
          members: {
            create: {
              user: { connect: { id: user.id } },
              teamRole: TeamRole.LEAD
            },
          },
        },
      });
      // 2. Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          country,
          users: { connect: { id: user.id } },
          owner: { connect: { id: user.id } },
          customer: { connect: { id: customerId } },
          tierSettings: { connect: { id: tierSettingsId } },
          orgIntegrations: {
            create: {
              calendly: {
                create: {
                  enabled: false,
                },
              },
              blandAi: {
                create: {
                  enabled: false,
                },
              },
              twilio: {
                create: {
                  enabled: false,
                },
              },
            },
          },
        },
      });

      // 3. Create user settings
      await tx.userSettings.create({
        data: {
          user: { connect: { id: user.id } },
        },
      });
      return { user, organization };
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("Onboarding error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}


export async function PATCH(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgId } = await req.json();
  if (!orgId) return NextResponse.json({ error: "Missing orgId" }, { status: 400 });

  await prisma.organization.update({
    where: { id: orgId },
    data: { onboardingCompleted: true},
  });

  return NextResponse.json({ ok: true });
}