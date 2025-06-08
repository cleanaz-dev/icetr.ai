import EnhancedDialer from "@/components/pages/dialer/EnhancedDialer";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import {
  getCallScriptDetails,
  getLeadsForUser,
  getOrganization,
} from "@/lib/service/prismaQueries";

export default async function page() {
  const { userId } = await auth();
  const leads = await getLeadsForUser(userId);
  const callScriptData = await getCallScriptDetails(userId);
  const campaignId = leads[0]?.campaignId; // Safe access in case leads is empty

  // console.log("leads", leads)
  // console.log("organization", callScriptData)
  console.log("campaignID", campaignId);
  return (
    <div>
      <EnhancedDialer data={leads} callScriptData={callScriptData} campaignId={campaignId}/>
    </div>
  );
}
