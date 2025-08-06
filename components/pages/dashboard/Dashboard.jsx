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
import { Circle } from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import LeadDistributionChart from "./LeadDistributionChart";
import DashboardStatsCard from "./DashboardStatsCard";
import { useDashboard } from "@/context/DashboardProvider";
import PageHeader from "@/components/ui/layout/PageHeader";

export default function Dashboard() {
  const { activities, leadCounts } = useDashboard();

  return (
    <div className="space-y-6 px-4 py-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Track and manage your leads and team performance"
        icon="LayoutDashboard"
      />

      {/* Stats Cards */}
      <DashboardStatsCard />
      {/* Main Content - Restructured Layout */}
      <div className="grid gap-6">
        {/* Pipeline and Recent Activities Side by Side */}
        <div className="grid gap-6 md:grid-cols-2">
          <LeadDistributionChart leadCounts={leadCounts} />
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
                          <Badge className="text-xs" variant="ghost">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </Badge>
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
