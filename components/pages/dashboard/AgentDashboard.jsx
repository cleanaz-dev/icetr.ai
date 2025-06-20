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
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
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
    campaigns,
    dashboardMetrics,
  } = data;

  // Set daily call target (could be configurable)
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

      {/* Key Performance Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        <StatCard
          title="Active Campaigns"
          value={dashboardMetrics.activeCampaigns}
          description="Campaigns you're part of"
          icon={BookOpen}
        />
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Your current performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Key Metrics */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" />
                  Connect Rate
                </span>
                <Badge variant={connectRate >= 20 ? "default" : "secondary"}>
                  {connectRate}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Total Leads
                </span>
                <Badge variant="secondary">{leads.total}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  Overdue Follow-ups
                </span>
                <Badge
                  variant={followUps.overdue > 0 ? "destructive" : "secondary"}
                >
                  {followUps.overdue}
                </Badge>
              </div>
            </div>

            {/* Campaign Info */}
            {campaigns.length > 0 && (
              <div className="pt-3 border-t">
                <h4 className="text-sm font-medium mb-2">
                  {campaigns.length === 1
                    ? "Active Campaign"
                    : "Active Campaigns"}
                </h4>
                <div className="space-y-3">
                  {campaigns.map((campaign, index) => (
                    <div key={campaign.id || index} className="space-y-1">
                      <p className="text-sm font-medium text-primary">{campaign.name}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {campaign.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Today's Focus</h3>
              <p className="text-sm text-muted-foreground">
                Recommended priority
              </p>
            </div>
          </div>
          <div className="mt-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {followUps.overdue > 0
                ? "Complete Overdue Follow-ups"
                : callsToday < callTarget
                ? "Reach Call Target"
                : "Great Work Today!"}
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Follow-up Status</h3>
              <p className="text-sm text-muted-foreground">Current workload</p>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Total:</span>
              <span className="font-medium">{followUps.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Due Today:</span>
              <span className="font-medium text-orange-600">
                {followUps.dueToday}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Recent Activity</h3>
              <p className="text-sm text-muted-foreground">Latest actions</p>
            </div>
          </div>
          <div className="mt-3">
            {recentActivities.length > 0 ? (
              <p className="text-sm">
                {recentActivities.length} recent activities
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
