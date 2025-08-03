import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { validateHasPermission } from "@/lib/db/validations";

export function withAuth(handler, options = {}) {
  return async function(request, context) {
    try {
      const params = await context.params;
      
      if (options.requireOrgId && !params.orgId) {
        return NextResponse.json({ message: "orgId required" }, { status: 400 });
      }

      const { userId: clerkId } = await auth();
      if (!clerkId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      if (options.permission) {
        await validateHasPermission(clerkId, [options.permission]);
      }

      return await handler(request, { params, clerkId });

    } catch (error) {
      console.error("API Error:", error);
      
      if (error.message?.includes("permission")) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  };
}

export const withOrgAuth = (handler, permission) => 
  withAuth(handler, { requireOrgId: true, permission });
