import BillingPage from "@/components/pages/billing/BillingPage";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { getOrgBillingData, getOrgId } from "@/lib/db/org";

export default async function page() {
  const { userId: clerkId } = await auth();
  const orgId = await getOrgId(clerkId);
  const { customerData, invoices, subscription } = await getOrgBillingData(
    clerkId,
    orgId
  );

console.log("subcription:", subscription);
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
