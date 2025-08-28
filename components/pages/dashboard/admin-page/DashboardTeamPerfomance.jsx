import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye } from "lucide-react";
import { Send } from "lucide-react";
import { Users } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function DashboardTeamPerfomance({ teams, onSelectTeam, setShowDialog, }) {
 

  const MiniStats = ({ team }) => {
    const calculateLeads = (team) => {
      return (
        team?.members?.reduce(
          (total, member) => total + (member.user._count?.assignedLeads || 0),
          0
        ) || 0
      );
    };

    const calculateCalls = (team) => {
      return (
        team?.members?.reduce(
          (total, member) => total + (member.user._count?.call || 0),
          0
        ) || 0
      );
    };

    const calculateBookings = (team) => {
      return (
        team?.members?.reduce(
          (total, member) => total + (member.user._count?.bookings || 0),
          0
        ) || 0
      );
    };

    return (
      <div className="flex justify-between gap-4 text-sm text-muted-foreground">
        <div className="bg-card p-2 rounded-md w-32 text-center">
          <p>Total Leads</p>
          <span className="font-semibold text-primary text-center">
            {calculateLeads(team)}
          </span>
        </div>
        <div className="bg-card p-2 rounded-md w-32 text-center">
          <p>Total Calls</p>
          <span className="font-semibold text-primary text-center">
            {calculateCalls(team)}
          </span>
        </div>
        <div className="bg-card p-2 rounded-md w-32 text-center">
          <p>Total Bookings</p>
          <span className="font-semibold text-primary text-center">
            {calculateBookings(team)}
          </span>
        </div>
      </div>
    );
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="text-primary size-4" /> Team Performance
        </CardTitle>
        <CardDescription>Monitor and manage your teams</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        {/* Team performance metrics */}
        <div className="flex flex-col gap-4">
          {/* Team performance metrics */}
          {teams.map((team, index) => (
            <div
              key={index}
              className="flex-col gap-2 items-center border rounded-lg bg-muted/25 p-4 space-y-4"
            >
              {/* header */}
              <header className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-muted/75 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{team.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {team.members.length} agents • Led by{" "}
                    {team.manager?.fullname ?? "No manager assigned"}{" "}
                  </p>
                </div>
              </header>
              <div>
                {/* team performance metrics */}
                <MiniStats team={team} />
              </div>
              {/* Action buttons */}
              <div className="flex gap-3">
                <Button size="sm" variant="outline" className="bg-card" asChild>
                  <Link href={`/teams/${team.id}`}>
                  <span className="text-xs flex gap-1 items-center">
                    <Eye className="size-3" /> View Team
                  </span>
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-card"
                  onClick={() => {
                    onSelectTeam(team.id); 
                    setShowDialog(true);
                  }}
                >
                  <span className="text-xs flex gap-1 items-center">
                    <Send className="size-3" /> Message Team
                  </span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter></CardFooter>
    </Card>
  );
}
