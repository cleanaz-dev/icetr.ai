import SystemStatus from "./SystemStatus";
import TrainingStatsCard from "./TrainingStatsCard";

// components/pages/training/StatusBar.tsx
export default function StatusBar({ trainingData, audioPermissionGranted, status }) {
  return (
    <div className="border-t py-2.5 bg-card shadow-md">
      <div className="max-w-xl md:max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <TrainingStatsCard trainingStats={trainingData} />
        <SystemStatus
          audioPermissionGranted={audioPermissionGranted}
          status={status}
        />
      </div>
    </div>
  );
}