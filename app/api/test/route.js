// app/api/test-json/route.js
import { getServerPublicIntegrationData } from "@/lib/db/integrations";
import redis from "@/lib/services/integrations/redis";
import { NextResponse } from "next/server";

export async function GET() {
  const testData = {
    name: "Welcome Campaign",
    type: "email",
    status: "active",
  };

  // Save JSON to Redis at root '$'
  await redis.json.set("campaign:welcome", ".", testData);

  // Retrieve the full object
  const value = await redis.json.get("campaign:welcome");

  return NextResponse.json({ value });
}

export async function POST(req) {
  const data = await req.json();
  try {
    const { orgId, provider, field } = data;

    const result = await getServerPublicIntegrationData(orgId, provider, field);


    return NextResponse.json(
      {
        message: "Working On It!",
        result: result,
      },
      { staus: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
