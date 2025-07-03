import { Target } from "lucide-react";
import { Phone } from "lucide-react";
import React from "react";

export default function TrainingStatsCard({ trainingStats }) {
  return (
    <div className="flex items-center gap-6 text-xs md:text-sm">
      <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
        <Phone className="size-4" />
        <p className="text-muted-foreground ">
          Practice Calls:{" "}
          <span className="font-semibold text-foreground">
            {trainingStats.length}
          </span>
        </p>
        {/* <span className="font-semibold">{stat.value}</span> */}
      </div>
      <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
        <Target className="size-4" />
        <p className="text-muted-foreground ">
          Avg. Score:{" "}
          <span className="font-semibold text-foreground">
            {trainingStats.length}
          </span>
        </p>
        {/* <span className="font-semibold">{stat.value}</span> */}
      </div>
    </div>
  );
}
