import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Circle } from "lucide-react";

export default function MonthlyTarget() {
  return (
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
  );
}
