// app/api/org/[orgId]/integrations/bland/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/services/prisma";
import { encryptIntegrationData } from "@/lib/encryption";
import {
  blandAiIntegrationSchema,
  formatZodError,
} from "@/lib/validations/integrations";
import { validateHasPermission } from "@/lib/services/db/validations";

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orgId } = await params;
    if (!orgId)
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );
    await validateHasPermission(userId,['integration.create'])
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { orgId: true, role: true },
    });
    if (!user || user.orgId !== orgId || user.role.type !== "SuperAdmin")
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    /* -------- parse & validate body -------- */
    const raw = await req.json();
    const parsed = blandAiIntegrationSchema.safeParse(raw);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Validation failed", issues: formatZodError(parsed.error) },
        { status: 400 }
      );

    /* -------- get existing integration -------- */
    const orgIntegration = await prisma.orgIntegration.findFirst({
      where: { orgId: orgId },
      include: { blandAi: true },
    });

    if (!orgIntegration)
      return NextResponse.json(
        { error: "OrgIntegration not found" },
        { status: 404 }
      );

    const { apiKey, ...rest } = parsed.data;
    const existingApiKey = orgIntegration.blandAi?.apiKey;

    // Smart encryption handling (single source of truth)
    let finalApiKey = existingApiKey; // Default to existing
    
    if (apiKey !== undefined && apiKey !== existingApiKey) {
      finalApiKey = apiKey.startsWith('v2:1:') 
        ? apiKey // Keep if already encrypted
        : encryptIntegrationData({ apiKey }, orgId);
    }

    /* -------- upsert integration -------- */
    await prisma.blandAiIntegration.upsert({
      where: { orgIntegrationId: orgIntegration.id },
      update: {
        ...rest,
        apiKey: finalApiKey,
        updatedAt: new Date(),
      },
      create: {
        orgIntegrationId: orgIntegration.id,
        ...rest,
        apiKey: finalApiKey,
      },
    });

    return NextResponse.json({ message: "Bland AI settings saved" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orgId } = await params;
    if (!orgId)
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );
    await validateHasPermission(userId,["integration.read"])
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { orgId: true },
    });

    if (!user || user.orgId !== orgId)
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const blandAiIntegration = await prisma.orgIntegration.findFirst({
      where: {
        orgId: orgId,
      },
      select: { blandAi: true },
    });

    return NextResponse.json({ blandAiIntegration }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
