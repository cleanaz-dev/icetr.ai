import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import { auth } from "@clerk/nextjs/server";
import { validateHasPermission } from "@/lib/services/db/validations";
import {
  calendlyIntegrationSchema,
  formatZodError,
} from "@/lib/validations/integrations";

export async function POST(req, { params }) {
  const { orgId } = await params;
  const { userId: clerkId } = await auth();
  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  if (!clerkId) {
    return NextResponse.json({ message: "Invalid User" }, { status: 401 });
  }
  try {
    await validateHasPermission(clerkId, ["integration.create"]);
    const body = await req.json(); // Add await here

    // Use the schema directly, not the wrapper function
    const validation = calendlyIntegrationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: formatZodError(validation.error) },
        { status: 400 }
      );
    }

    const { enabled, webhookUrl, orgUri } = validation.data;

    const orgIntegration = await prisma.orgIntegration.findFirst({
      where: {
        orgId: orgId,
      },
      select: {
        id: true,
      },
    });
    await prisma.calendlyIntegration.upsert({
      where: { orgIntegrationId: orgIntegration.id },
      update: {
        enabled,
        orgUri: orgUri || null,
        webhookUrl: webhookUrl || null,
      },
      create: {
        orgIntegrationId: orgIntegration.id,
        enabled,
        orgUri: orgUri || null,
        webhookUrl: webhookUrl || null,
      },
    });
    return NextResponse.json(
      { message: "Successfully Created Calendly Integration" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const { orgId } = await params;
  const { userId: clerkId } = await auth();
  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  if (!clerkId) {
    return NextResponse.json({ message: "Invalid User" }, { status: 401 });
  }
  try {
    await validateHasPermission(clerkId, ["integration.update"]);
    const { enabled, integrationId } = await req.json();

    await prisma.calendlyIntegration.update({
      where: {
        id: integrationId,
      },
      data: {
        enabled,
      },
    });

    return NextResponse.json(
      { message: "Calendly Integration Disabled!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
