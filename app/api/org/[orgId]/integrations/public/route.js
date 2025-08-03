import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { validateHasPermission } from "@/lib/db/validations";
import { filterPublicFields } from "@/lib/utils";

/**
 * GET public fields for an integration by type and org ID.
 * Expects query param ?type=integrationType (e.g., calendlyIntegration)
 */
export async function GET(req, { params }) {
  const { orgId } = params;
  const { userId: clerkId } = await auth();

  if (!orgId) {
    return NextResponse.json(
      { message: "Invalid request: missing orgId" },
      { status: 400 }
    );
  }

  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (!type) {
    return NextResponse.json(
      { message: "Missing integration type" },
      { status: 400 }
    );
  }

  try {
    await validateHasPermission(clerkId, ["integration.public"]);
    let integration = null;

    switch (type) {
      case "calendlyIntegration":
        integration = await prisma.calendlyIntegration.findFirst({
          where: { orgIntegration: { orgId } },
          include: { publicFields: true },
        });
        break;
      case "twilioIntegration":
        integration = await prisma.twilioIntegration.findFirst({
          where: { orgIntegration: { orgId } },
          include: { publicFields: true },
        });
        break;
      case "blandAiIntegration":
        integration = await prisma.blandAiIntegration.findFirst({
          where: { orgIntegration: { orgId } },
          include: { publicFields: true },
        });
        break;
      default:
        return NextResponse.json(
          { message: "Unsupported integration type" },
          { status: 400 }
        );
    }

    if (!integration) {
      return NextResponse.json(
        { message: "Integration not found" },
        { status: 404 }
      );
    }

    const publicData = filterPublicFields(integration);
    return NextResponse.json(publicData, { status: 200 });
  } catch (error) {
    console.error("[PUBLIC_INTEGRATION_ERROR]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
