import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Trophy, Award, Target, UserPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function PortalRecentActivities({ recentActivities = [] }) {
  const ActivityItem = ({ activity }) => {
    // Adjust this based on your activity data keys: type or status?
    const type = activity.type?.toLowerCase() || "default";

    const statusIcon = () => {
      switch (type) {
        case "assignment":
          return (
            <div className="p-2.5 rounded-full bg-muted">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
          );
        case "booking":
          return (
            <div className="p-2.5 rounded-full bg-muted">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
          );
        case "tie":
          return (
            <div className="p-2.5 rounded-full bg-muted">
              <Award className="w-5 h-5 text-primary" />
            </div>
          );
        default:
          return (
            <div className="p-2.5 rounded-full bg-muted">
              <Activity className="w-5 h-5 text-primary" />
            </div>
          );
      }
    };

    return (
      <div key={activity.id} className="  border-gray-200 pb-3 last:pb-0">
        <div className="flex items-center gap-2 mb-1">
          {statusIcon()}
          <div className="flex justify-between items-center flex-1 min-w-0">
            <div className="font-semibold">
              <p className="text-base">{activity.type || "Activity"}</p>
              <p className=" text-xs text-muted-foreground">
                {activity.content}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(activity.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* <span>{activity.createdUser?.fullname || "Unknown User"}</span> */}
      </div>
    );
  };

  if (recentActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Team Activity
          </CardTitle>
          <CardDescription>No recent activities found.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="min-h-[300px] max-h-[500px] hover:border-primary transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Team Activity
        </CardTitle>
        <CardDescription>
          Recent wins and milestones from your team
        </CardDescription>
      </CardHeader>
        <Separator />
      <CardContent>
        {recentActivities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </CardContent>
    </Card>
  );
}
