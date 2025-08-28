"use client";
import React, { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Target, Award, Star, Crown, Medal } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function MyTeam({ teamMembers }) {
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "MANAGER":
        return "default";
      case "LEAD":
        return "secondary";
      default:
        return "outline";
    }
  };

  console.log("teamMembers", teamMembers);
  return (
    <>
      <Card className="min-h-[400px] hover:border-primary transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            My Team
          </CardTitle>
          <CardDescription>
            The amazing people you work with every day
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {teamMembers?.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-background "
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.firstname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {getInitials(member.firstname, member.lastname)}
                      </span>
                    )}
                  </div>
                  {member.teamRole === "MANAGER" && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex justify-between items-center w-full">
                      <p className="font-medium truncate">
                        {member.firstname} {member.lastname}
                      </p>
                      <Badge
                        variant={getRoleBadgeColor(member.teamRole)}
                        className="text-xs"
                      >
                        {member.teamRole}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {member.assignedLeadsCount || 0} assinged leads
                    </span>
                    {member.teamRole === "MANAGER" && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Crown className="w-3 h-3" />
                        Team Manager
                      </span>
                    )}
                    {member.teamRole === "LEAD" && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Crown className="w-3 h-3" />
                        Team Lead
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Leaderboard */}
      <Card className="mt-6 min-h-[300px] max-h-[500px] hover:border-primary transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Team Leaderboard
          </CardTitle>
          <CardDescription>This month's top performers</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          <div className="space-y-3">
            {teamMembers
              .sort(
                (a, b) =>
                  (b.user._count?.assignedLeads || 0) -
                  (a.user._count?.assignedLeads || 0)
              )
              .map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-background"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    {index === 0 && (
                      <Trophy className="w-4 h-4 text-yellow-600" />
                    )}
                    {index === 1 && <Medal className="w-4 h-4 text-gray-500" />}
                    {index === 2 && (
                      <Award className="w-4 h-4 text-amber-600" />
                    )}
                    {index > 2 && (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>

                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.firstname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {getInitials(member.firstname, member.lastname)}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {member.firstname} {member.lastname}
                      </p>
                      {index === 0 && (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {member.bookingsCount || 0} Bookings
                    </p>
                  </div>

                  <div className="text-right">
                    <Badge variant={index < 3 ? "default" : "outline"}>
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
