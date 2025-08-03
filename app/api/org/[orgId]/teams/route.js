import { withOrgAuth } from "@/lib/api/withAuth";
import { createTeam } from "@/lib/services/team-service";
import { NextResponse } from "next/server";

async function createTeamHandler(request, { params, clerkId }) {
  const { name, addSelf } = await request.json();
  
  // Validate input
  if (!name?.trim()) {
    return NextResponse.json({ message: "Team name is required" }, { status: 400 });
  }

  console.log("Creating team:", { name, addSelf, orgId: params.orgId });

  // Business logic
  const result = await createTeam({
    name: name.trim(),
    orgId: params.orgId,
    creatorClerkId: clerkId,
    addSelf: Boolean(addSelf),
  });

  return NextResponse.json({
    message: "Team created successfully",
    team: result.team,
    members: result.members,
  }, { status: 201 });
}

export const POST = withOrgAuth(createTeamHandler, "team.create");