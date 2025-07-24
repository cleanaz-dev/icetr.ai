import React from "react";
import { auth } from "@clerk/nextjs/server";
import {
  getTeamAndMembers,
  getTeamLeads,
  getTeamTrainingData,
  getUserRole,
} from "@/lib/service/prismaQueries";
import { notFound, redirect } from "next/navigation";
import SingleTeamPage from "@/components/pages/teams/SingleTeamPage";

export default async function page({ params }) {
  const { teamId } = await params;
  const { userId } = await auth();
  const { team, members, campaigns } = await getTeamAndMembers(userId, teamId);
  const { teamLeads } = await getTeamLeads(userId);
  const { teamTrainings } = await getTeamTrainingData(teamId, userId)

  // console.log("Team:", team)
  // console.log("Team Leads", teamLeads)
  // Check if user is authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  const userRole = await getUserRole(userId);

  // Check if user has permission
  if (userRole === "agent") {
    return notFound();
  }

  return (
    <div>
      <SingleTeamPage
        leads={teamLeads}
        team={team}
        members={members}
        campaigns={campaigns}
        trainingData={teamTrainings}
      />
    </div>
  );
}
