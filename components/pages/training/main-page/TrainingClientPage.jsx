"use client";

import { useCoreContext } from "@/context/CoreProvider";
import React from "react";
import StatusBar from "../status-bar/StatusBar";
import TrainingPage from "./TrainingPage";
import { useEffect } from "react";

export default function TrainingClientPage({
  trainingData,
  userProfile,
  orgId,
  blandAiSettings,
  trainingAvgAndCount,
}) {
  const {
    initializeTwilioDevice,
    twilioDevice: device,
    twilioError: error,
    twilioStatus: status,
  } = useCoreContext();

  useEffect(() => {
    if (orgId) {
      initializeTwilioDevice(orgId);
    }
  }, [orgId]);

  return (
    <div className="flex flex-col h-screen">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto relative">
        <TrainingPage
          trainingData={trainingData}
          userProfile={userProfile}
          orgId={orgId}
          blandAiSettings={blandAiSettings}
          trainingAvgAndCount={trainingAvgAndCount}
          device={device}
          status={status}
          error={error}
        />
      </div>
      {/* Fixed bottom bar */}
      <div className="w-full">
        <StatusBar
          trainingAvgAndCount={trainingAvgAndCount}
          device={device}
          status={status}
          error={error}
        />
      </div>
    </div>
  );
}
