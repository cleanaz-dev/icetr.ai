import EnhancedDialer from "@/components/pages/dialer/EnhancedDialer";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import {
  getCallScriptDetails,
} from "@/lib/services/prismaQueries";
import { getOrgId } from "@/lib/db/org";
import { getLeadsForUser } from "@/lib/db/user";

export default async function page() {
  const { userId } = await auth();
  const orgId = await getOrgId(userId);

  const callScriptData = await getCallScriptDetails(userId,orgId);


  // if (!leads || leads.length === 0) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-full text-center py-12">
  //       <h2 className="text-xl font-semibold mb-2">No Leads Found</h2>
  //       <p className="text-muted-foreground">
  //         You don’t have any leads yet. Please add leads to begin dialing.
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div>
      <EnhancedDialer

        callScriptData={callScriptData}
  
       
      />
    </div>
  );
}
