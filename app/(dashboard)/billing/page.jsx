import BillingPage from "@/components/pages/billing/BillingPage";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { getOrgBillingData, getOrgId } from "@/lib/db/org";
import { notFound } from "next/navigation";
import { validateHasPermission, validateOrgAccess } from "@/lib/db/validations";

export default async function page() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }
  const orgId = await getOrgId(clerkId);

  try {
    await validateOrgAccess(clerkId, orgId);
    await validateHasPermission(clerkId, ["billing.read"]);
  } catch {
    notFound();
  }
  const { customerData, invoices, subscription } = await getOrgBillingData(
    clerkId,
    orgId
  );

  return (
    <div>
      <BillingPage
        customer={customerData}
        subscription={subscription}
        invoices={invoices}
      />
    </div>
  );
}
