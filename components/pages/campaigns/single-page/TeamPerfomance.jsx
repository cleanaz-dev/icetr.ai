import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { ImUsers } from "react-icons/im";

export default function TeamPerformance({ campaign, unassignedLeads }) {
  console.log("members: ", campaign.team?.members);
  return (
    <div className="flex h-[500px]">
      <div className="bg-card rounded-lg border shadow-sm flex-1 flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Team Performance</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Lead distribution and performance by team member
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            {campaign.team?.members?.length > 0 ? (
              campaign.team.members.map((member) => (
                <div
                  key={member.user.id}
                  className="flex items-center justify-between px-4 py-2 border rounded-lg hover:bg-muted/25 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.user.imageUrl} />
                      <AvatarFallback>
                        {member.user.firstname[0]}
                        {member.user.lastname[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-medium">
                        {member.user.firstname} {member.user.lastname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.teamRole} {/* This will show MANAGER */}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-lg font-semibold">
                        {member.user._count?.assignedLeads || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Assigned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">
                        {member.user._count?.contactedLeads || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Contacted</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {Math.round(
                          (member.user._count?.contactedLeads /
                            member.user._count?.assignedLeads) *
                            100
                        ) || 0}
                        %
                      </p>
                      <p className="text-xs text-muted-foreground">Rate</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No team members assigned to this campaign
                </p>
                <button className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
                  Assign Team Members
                </button>
              </div>
            )}

            {/* Unassigned Leads */}
            <div className="flex items-center justify-between px-4 py-2 border rounded-lg  bg-muted">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-orange-200  flex items-center justify-center">
                  <ImUsers className="text-orange-600"/>
                </div>
                <div>
                  <p className="font-medium text-orange-700 ">
                    Unassigned Leads
                  </p>
                  <p className="text-sm text-muted-foreground ">
                    Pending assignment
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-orange-700">
                  {unassignedLeads.length}
                </p>
                <p className="text-xs text-muted-foreground">Leads</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
