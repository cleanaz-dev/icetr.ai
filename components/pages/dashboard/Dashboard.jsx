"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  Activity,
  Calendar,
  FileText,
  Target,
  Search,
  Plus,
  ArrowUp,
  ArrowDown,
  Circle,
} from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardProvider";
import LeadDistributionChart from "./LeadDistributionChart";
import DashboardStatsCard from "./DashboardStatsCard";

// Updated stats (Members instead of Hot Leads)

// Pipeline stages
const pipelineStages = [
  { name: "New", count: 120, color: "bg-blue-500" },
  { name: "Contacted", count: 90, color: "bg-purple-500" },
  { name: "Qualified", count: 60, color: "bg-yellow-500" },
  { name: "Proposal", count: 30, color: "bg-orange-500" },
  { name: "Closed", count: 15, color: "bg-green-500" },
];

export default function Dashboard() {
  const { activities, leadCounts } = useDashboard();

  return (
    <div className="space-y-6 px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="border-2 border-primary p-2 rounded-full text-primary">
              <LayoutDashboard />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Track and manage your leads and team performance
          </p>
        </div>

       
      </header>

      {/* Stats Cards */}
     <DashboardStatsCard />

      {/* Main Content - Restructured Layout */}
      <div className="grid gap-6">
        {/* Pipeline and Recent Activities Side by Side */}
        <div className="grid gap-6 md:grid-cols-2">
         <LeadDistributionChart  leadCounts={leadCounts}/>
          {/* Recent Activities */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest lead interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((item, i) => {
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={item.createdUser.imageUrl} />
                        <AvatarFallback>UN</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          <span className="text-primary">
                            {item.createdUser.firstname}
                          </span>{" "}
                          <span>{item.type}</span>
                        </p>
                        <p>{item.content}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {item.time}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className="text-xs">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Goal - Full Width Below */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Goal</CardTitle>
            <CardDescription>50 conversions target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Current Progress</span>
                <span className="text-sm font-medium">32/50 (64%)</span>
              </div>
              <Progress value={64} />
              <div className="flex justify-between text-sm">
                <span className="flex items-center">
                  <Circle className="h-2 w-2 mr-2 text-green-500 fill-green-500" />
                  On track
                </span>
                <span>8 days remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
