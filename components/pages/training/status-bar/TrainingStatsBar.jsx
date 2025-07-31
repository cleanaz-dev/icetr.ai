import { Target } from "lucide-react";
import { Phone } from "lucide-react";
import React from "react";

export default function TrainingStatsBar({ trainingStats }) {
  const {
    _count: trainigCalls,
    _avg: { overallScore: avgScore },
  } = trainingStats;
  return (
    <div className="flex items-center gap-6 text-xs">
      <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
        <Phone className="size-4" />
        <p className="text-muted-foreground ">
          Practice Calls:{" "}
          <span className="font-semibold text-foreground">
            {trainigCalls}
          </span>
        </p>
        {/* <span className="font-semibold">{stat.value}</span> */}
      </div>
      <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
        <Target className="size-4" />
        <p className="text-muted-foreground ">
          Avg. Score:{" "}
          <span className="font-semibold text-foreground">
            {avgScore ?? "N/A"}
          </span>
        </p>
        {/* <span className="font-semibold">{stat.value}</span> */}
      </div>
    </div>
  );
}
