import TeamsPage from "@/components/pages/teams/TeamsPage";
import { getOrgId } from "@/lib/db/org";
import { getAllOrgLeads, getTeamData } from "@/lib/services/prismaQueries";
import { auth } from "@clerk/nextjs/server";
import React from "react";

export default async function page() {
  const { userId: clerkId } = await auth();


  return (
    <div>
      <TeamsPage />
    </div>
  );
}
