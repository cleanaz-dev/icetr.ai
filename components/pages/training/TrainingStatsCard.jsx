import React from "react";

export default function TrainingStatsCard({ trainingStats }) {
  return (
    <div className="flex items-center gap-6 text-sm">
      {trainingStats.map((stat, index) => (
        <div key={index} className="flex items-center gap-2">
          <stat.icon className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">{stat.label}:</span>
          <span className="font-semibold">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
