import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import { auth } from "@clerk/nextjs/server"

export async function GET(req, { params }) {
  try {
    const { keyId } = await params;
    
    // Authentication check
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user and check role
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
      select: { role: true }
    });
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Check if user has admin role
    if (user.role !== "Admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    // Find the API key
    const record = await prisma.apiKey.findUnique({
      where: { id: keyId },
      select: { plainKey: true }
    });
    
    if (!record) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }
    
    return NextResponse.json({ key: record.plainKey });
    
  } catch (error) {
    console.error("Error fetching API key:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { orgId, keyId } = await params;
    
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

    // Find the API key to ensure it exists and belongs to the org
    const existingKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
      select: { orgId: true, name: true }
    });

    if (!existingKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // Verify the key belongs to the correct org
    if (existingKey.orgId !== orgId) {
      return NextResponse.json(
        { error: "API key does not belong to this organization" },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false (recommended)
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false }
    });

    // Alternative: Hard delete (uncomment if you prefer this approach)
    // await prisma.apiKey.delete({
    //   where: { id: keyId }
    // });

    return NextResponse.json(
      { message: "API key deleted successfully" },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}