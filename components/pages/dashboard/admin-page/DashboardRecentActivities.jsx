import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Activity } from "lucide-react";


export default function DashboardRecentActivities({ activities }) {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle><span className="flex items-center gap-2"><Activity  className="text-primary size-4"/>Recent Activities</span></CardTitle>
        <CardDescription>Latest lead interactions</CardDescription>
      </CardHeader>
      <Separator />
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
                
                    <span>{item.type}</span>
                  </p>
                  <p className="text-xs">{item.content}</p>
                      <span className="text-primary text-xs">
                      {item.createdUser.fullname}
                    </span>{" "}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{item.time}</p>
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
  );
}
