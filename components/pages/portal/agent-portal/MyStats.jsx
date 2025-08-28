import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Users, Target, TrendingUp, Calendar } from "lucide-react";
export default function MyStats({ stats, teamMembers }) {
  console.log("stats:", stats); 
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Team Progress */}
      <Card className=" border-blue-400/50 ">
        <CardHeader>
          <CardTitle>
            <span className="flex justify-between items-center underline decoration-blue-400">
              Daily Calls <Target />
            </span>{" "}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-blue-700">
            {stats.call}
          </p>
        </CardContent>
      </Card>
      {/* Conversion Rate */}
      <Card className="border-green-400/50">
        <CardHeader>
          <CardTitle>
            <span className="flex justify-between items-center underline decoration-green-400">
              Leads <TrendingUp />
            </span>{" "}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-700 ">
            {stats.assignedLeads}
          </p>
        </CardContent>
      </Card>

      <Card className="border-purple-500/50">
        <CardHeader>
          <CardTitle>
            {" "}
            <span className="flex justify-between items-center underline decoration-purple-500">
              Bookings <Calendar />
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-purple-700">
            {stats.bookings}
          </p>
        </CardContent>
      </Card>
      {/* Team Size */}
      <Card className="border-orange-500/50">
        <CardHeader>
          <CardTitle>
            {" "}
            <span className="flex justify-between items-center underline decoration-orange-400">
              Team Size <Users />
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-orange-700">
            {teamMembers.length} members
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
