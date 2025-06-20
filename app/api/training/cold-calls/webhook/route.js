import { NextResponse } from "next/server";
import prisma from "@/lib/service/prisma";

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("data", data);
    if (!data) {
      return NextResponse.json({ message: "Invalid Data" }, { status: 404 });
    }
    return NextResponse.json({ message: "Recieved webhook" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
