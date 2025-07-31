import { NextResponse } from "next/server";
import { hash } from "argon2";
import { randomBytes } from "crypto";
import prisma from "@/lib/services/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req, { params }) {
  try {
    const { orgId } = await params;
    
    // Authentication check
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user and check role
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
      select: { role: true, orgId: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Check if user has admin role OR belongs to the same org
    if (user.role !== "Admin" && user.orgId !== orgId) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    const keys = await prisma.apiKey.findMany({
      where: { orgId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json(
      keys.map((k) => ({
        id: k.id,
        name: k.name,
        createdAt: k.createdAt,
        lastUsedAt: k.lastUsedAt,
        expiresAt: k.expiresAt,
        campaignIds: k.campaignIds,
      }))
    );
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { orgId } = await params;
    
    // Authentication check
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user and check role
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
      select: { role: true, orgId: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Check if user has admin role OR belongs to the same org
    if (user.role !== "Admin" && user.orgId !== orgId) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { name, campaignIds = [], expiresAt = null } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Valid name is required" }, { status: 400 });
    }
    
    if (!Array.isArray(campaignIds) || campaignIds.length === 0) {
      return NextResponse.json({ error: "At least one campaign ID is required" }, { status: 400 });
    }

    // Validate that all campaigns exist and belong to the org
    const campaignCount = await prisma.campaign.count({
      where: { id: { in: campaignIds }, orgId },
    });
    
    if (campaignCount !== campaignIds.length) {
      return NextResponse.json({ error: "One or more campaigns not found or don't belong to this organization" }, { status: 400 });
    }

    // Generate API key
    const raw = `org_${orgId}_${randomBytes(16).toString("hex")}`;
    const hashed = await hash(raw);
    
    const apiKey = await prisma.apiKey.create({
      data: {
        plainKey: raw,
        key: hashed,
        name: name.trim(),
        orgId,
        campaignIds,
        scopes: ["lead:create"],
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    
    return NextResponse.json(
      { 
        id: apiKey.id, 
        key: raw,
        name: apiKey.name,
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt,
        campaignIds: apiKey.campaignIds
      }, 
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}