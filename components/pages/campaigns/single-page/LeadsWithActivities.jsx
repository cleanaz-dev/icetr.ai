import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RiUserFill } from "react-icons/ri";

export default function LeadsWithActivities({ leadsWithActivities }) {
  if (!leadsWithActivities || leadsWithActivities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No activities found</p>
      </div>
    );
  }

  // Flatten all activities from all leads into one array
  const allActivities = leadsWithActivities.flatMap(
    (lead) => lead.activities || []
  );

  if (allActivities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No activities found</p>
      </div>
    );
  }

  // Sort activities by timestamp (most recent first) and take the latest 10
  const latestActivities = allActivities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  return (
    <div className="space-y-0">
      {latestActivities.map((activity, i) => (
        <div key={activity.id || i}>
          <div className="flex items-start space-x-3 p-4">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage
                src={activity.createdUser.imageUrl}
                alt={activity.createdUser.fullname}
              />
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                {activity.createdUser.firstname?.[0]}
                {activity.createdUser.lastname?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm">{activity.content}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>

              <p className="flex gap-1 items-center text-xs text-muted-foreground">
                <RiUserFill className="text-primary" />
                {activity.createdUser.fullname}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
