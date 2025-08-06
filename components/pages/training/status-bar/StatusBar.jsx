"use client";
import { useEffect, useState } from "react";
import SystemStatus from "./SystemStatus";
import TrainingStatsBar from "./TrainingStatsBar";
import { useTeamContext } from "@/context/TeamProvider";

export default function StatusBar({ trainingAvgAndCount, device, status, error }) {
  const { orgId } = useTeamContext();

  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);

  // Request audio permissions when device is ready
  useEffect(() => {
    const requestAudioPermissions = async () => {
      if (device && status === "Ready" && !audioPermissionGranted) {
        try {
          // Request microphone permissions
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          // Stop the stream immediately, we just needed permissions
          stream.getTracks().forEach((track) => track.stop());

          setAudioPermissionGranted(true);
          console.log("Audio permissions granted");
        } catch (err) {
          console.error("Audio permission denied:", err);
          setTrainingStatus("idle");
        }
      }
    };

    requestAudioPermissions();
  }, [device, status, audioPermissionGranted]);

  return (
    <div className="py-2.5 bg-card shadow-md">
      <div className="max-w-xl md:max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <TrainingStatsBar trainingStats={trainingAvgAndCount} />
        <SystemStatus
          audioPermissionGranted={audioPermissionGranted}
          status={status}
        />
      </div>
    </div>
  );
}
