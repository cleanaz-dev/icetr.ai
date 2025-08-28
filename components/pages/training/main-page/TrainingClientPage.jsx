"use client";

import React from "react";
import TrainingPage from "./TrainingPage";

export default function TrainingClientPage({
  trainingData,
  userProfile,
  orgId,
  blandAiSettings,
  trainingAvgAndCount,
}) {
  console.log("blandAiSettings:", blandAiSettings);
  // All device/status props become **local to TrainingPage**.
  // We’ll inject Bland’s connection info instead.
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto relative">
        <TrainingPage
          trainingData={trainingData}
          userProfile={userProfile}
          orgId={orgId}
          blandAiSettings={blandAiSettings}
          trainingAvgAndCount={trainingAvgAndCount}
          // NEW: pass Bland SDK config
          blandConfig={blandAiSettings}
        />
      </div>
      {/* StatusBar is now inside TrainingPage (or removed if redundant) */}
    </div>
  );
}