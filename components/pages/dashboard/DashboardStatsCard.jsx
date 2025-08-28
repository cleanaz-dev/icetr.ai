"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/context/DashboardProvider";
import { ArrowDown, ArrowUp, Target, TrendingUp, Users, Calendar, PhoneCall } from "lucide-react";

export default function DashboardStatsCard() {
  const { dashboardStats } = useDashboard();

  // Format the stats data to match your card structure
  const formattedStats = [
    {
      title: "Total Leads",
      value: dashboardStats?.totalLeads.toLocaleString() || "0",
      change: dashboardStats?.leadChange ? `${dashboardStats.leadChange}%` : "0%",
      icon: Target,
      trend: dashboardStats?.leadChange && dashboardStats.leadChange >= 0 ? "up" : "down",
    },
    {
      title: "Total Calls",
      value: dashboardStats?.conversionRate ? `${dashboardStats.conversionRate}%` : "0%",
      change: "+3.2%", // You'll need to calculate this from your data
      icon: PhoneCall,
      trend: "up", // You'll need to determine this from your data
    },
    {
      title: "Bookings",
      value: dashboardStats?.totalMembers.toString() || "0",
      change: dashboardStats?.memberChange ? `+${dashboardStats.memberChange}` : "+0",
      icon: Calendar,
      trend: dashboardStats?.memberChange && dashboardStats.memberChange >= 0 ? "up" : "down",
    },
    {
      title: "Conversion Rate",
      value: dashboardStats?.avgConversionTime ? `${dashboardStats.avgConversionTime} days` : "0 days",
      change: "-0.5", // You'll need to calculate this from your data
      icon: TrendingUp,
      trend: "down", // You'll need to determine this from your data
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {formattedStats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stat.trend === "up" ? (
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span
                className={
                  stat.trend === "up" ? "text-green-500" : "text-red-500"
                }
              >
                {stat.change}{" "}
                {stat.title.includes("Rate")
                  ? ""
                  : stat.title.includes("Time")
                  ? "days"
                  : ""}
              </span>
              <span className="text-muted-foreground ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}