import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTeamContext } from "@/context/TeamProvider";
import { Archive } from "lucide-react";
import { Trash2 } from "lucide-react";
import { Eye } from "lucide-react";
import { FilePenLine } from "lucide-react";
import {
  Send,
  Megaphone,
  BookOpen,
  AlertTriangle,
  Info,
  Bell,
  ShieldAlert,
} from "lucide-react";
import React from "react";
import { getBroadcastConfig } from "@/lib/utils";

const BroadcastItem = ({ broadcast }) => {
  const config = getBroadcastConfig(broadcast.type);
  const Icon = config.icon;

  const recipientText =
    broadcast.teams.length === 0
      ? ""
      : broadcast.teams.length === 1
      ? `To: ${broadcast.teams[0].name}`
      : `To: ${broadcast.teams.map((t) => t.name).join(", ")}`;

  return (
    <div
      className={`p-4 rounded-lg bg-muted/25 border ${config.bgColor} ${config.borderColor} mb-3`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className={`font-semibold ${config.decoration}`}>
              {broadcast?.title}
            </h3>
            <div className="flex gap-2">
              <Button size="icon" variant="menu" className="hover:bg-muted">
                <Archive />
              </Button>
              <Button size="icon" variant="menu" className="hover:bg-muted">
                <FilePenLine />
              </Button>
              <Button size="icon" variant="menu" className="hover:bg-muted">
                <Trash2 className="text-rose-500" />
              </Button>
            </div>
          </div>

          <p className="text-sm ">{broadcast?.message}</p>
          <div className="flex gap-4 text-xs text-muted-foreground items-center mt-2 font-light">
            <p>{recipientText}</p>

            <p>By: {broadcast.createdUser?.fullname} on</p>
            <p>{new Date(broadcast?.createdAt).toLocaleString()}</p>
            <p className="flex gap-1 items-center">
              <Eye className="size-3" /> Views: {broadcast?.views}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TeamBroadCasts({ broadcasts, setShowDialog }) {
  const { getTeamByTeamId } = useTeamContext();
 
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex gap-2 items-center">
            <Send className="size-4 text-primary" />
            <p>Team Broadcasts</p>
          </div>
        </CardTitle>
        <CardDescription>
          Send announcements, updates and alerts to your teams
        </CardDescription>
        <CardAction>
          <Button size="sm" onClick={() => setShowDialog(true)}>
            {" "}
            <Send className="size-4" /> Send Broadcast
          </Button>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        {broadcasts ? (
          broadcasts?.map((broadcast) => (
            <BroadcastItem key={broadcast.id} broadcast={broadcast} />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No broadcasts yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
