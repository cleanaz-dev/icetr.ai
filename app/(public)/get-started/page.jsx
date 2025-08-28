import GetStartedPage from "@/components/pages/get-started/GetStartedPage";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getOrgId } from "@/lib/db/org";

export default async function page() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const orgId = await getOrgId(userId);
  if (!orgId) {
    notFound();
  }
  return (
    <div>
      <GetStartedPage orgId={orgId} />
    </div>
  );
}
