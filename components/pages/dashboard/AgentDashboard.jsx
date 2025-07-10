import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  UserRound,
  BarChart2,
  BadgeInfo,
  Phone,
  TrendingUp,
  Target,
  Clock,
  AlertCircle,
  BarChart3,
  Zap,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
}) => {
  const getValueColor = () => {
    if (variant === "success") return "text-green-600";
    if (variant === "warning") return "text-yellow-600";
    if (variant === "danger") return "text-red-600";
    return "";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium truncate">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getValueColor()}`}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            <span className="text-xs text-green-600">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function AgentDashboard({ data }) {
  const {
    leads,
    followUps,
    todayCallSession,
    recentActivities,
    dashboardMetrics,
  } = data;

  // Set daily call target (could be configurable)
  const {
    teamName,
    managerName,
    teamMemberCount,
    campaignCount,
    managerImageUrl,
  } = dashboardMetrics.teamInformation;
  const callTarget = 30;
  const weeklyBookingGoal = 8;

  const callsToday = todayCallSession?.totalCalls || 0;
  const successfulCallsToday = todayCallSession?.successfulCalls || 0;
  const callProgress = (callsToday / callTarget) * 100;
  const connectRate =
    callsToday > 0 ? Math.round((successfulCallsToday / callsToday) * 100) : 0;

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            Track your daily performance and goals
          </p>
        </div>
      </div>
      <div>
        {/* Team Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />

                <span>{teamName}</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Manager */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <UserRound className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Manager
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                   
                    {managerName || (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                     <Avatar>
                      <AvatarImage src={managerImageUrl} />
                      <AvatarFallback>M</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Users className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Members
                  </p>
                  <p className="text-sm font-medium">{teamMemberCount}</p>
                </div>
              </div>

              {/* Campaigns */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <BarChart2 className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Campaigns
                  </p>
                  <p className="text-sm font-medium">{campaignCount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        <StatCard
          title="Assigned Leads"
          value={dashboardMetrics.assignedLeads}
          description="Active leads to contact"
          icon={Users}
        />
        <StatCard
          title="Calls Today"
          value={`${callsToday}/${callTarget}`}
          description={`${Math.round(callProgress)}% of daily goal`}
          icon={Phone}
          variant={
            callProgress >= 100
              ? "success"
              : callProgress >= 50
              ? "warning"
              : "default"
          }
        />
        <StatCard
          title="Follow Ups"
          value={followUps.dueToday}
          description={
            followUps.overdue > 0
              ? `${followUps.overdue} overdue`
              : "All up to date"
          }
          icon={Clock}
          variant={followUps.overdue > 0 ? "danger" : "success"}
        />
        {/* <StatCard
          title="Active Campaigns"
          value={dashboardMetrics.activeCampaigns}
          description="Campaigns you're part of"
          icon={BookOpen}
        /> */}
      </div>

      {/* Daily Progress and Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Daily Call Progress
            </CardTitle>
            <CardDescription>
              Track your calling activity for today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Calls Made</span>
                <span className="font-medium">
                  {callsToday}/{callTarget}
                </span>
              </div>
              <Progress value={Math.min(callProgress, 100)} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-blue-600">{callsToday}</p>
                <p className="text-xs text-muted-foreground">Total Calls</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-green-600">
                  {successfulCallsToday}
                </p>
                <p className="text-xs text-muted-foreground">Successful</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-muted-foreground">
                  {Math.max(0, callTarget - callsToday)}
                </p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
