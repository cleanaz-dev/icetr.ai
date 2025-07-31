import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import { auth } from "@clerk/nextjs/server";
import { decryptIntegrationData } from "@/lib/encryption";

export async function POST(req, { params }) {
  const { userId: clerkId } = await auth()
  const { orgId } = await params
  
  try {
  } catch (error) {}
}
