import React from "react";
import { auth } from "@clerk/nextjs/server";
import {
  getTeamTrainingData,
} from "@/lib/services/prismaQueries";
import { notFound, redirect } from "next/navigation";
import SingleTeamPage from "@/components/pages/teams/SingleTeamPage";

export default async function page({ params }) {
  const { teamId } = await params;
  const { userId } = await auth();


  // console.log("Team:", team)
  // console.log("Team Leads", teamLeads)
  // Check if user is authenticated
  if (!userId) {
    redirect("/sign-in");
  }



  return (
    <div>
      <SingleTeamPage
        teamId={teamId}
      />
    </div>
  );
}
