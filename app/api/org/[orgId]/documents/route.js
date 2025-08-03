//api/documents

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("data", data);
    return NextResponse.json({ message: "Document received" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
